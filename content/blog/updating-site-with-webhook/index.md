+++
title = "Automatically Updating My Zola Site Using a Webhook"
date = 2023-08-28
updated = 2023-12-02

[taxonomies]
tags = ["TIL", "automation", "Zola"]

[extra]
copy_button = true
footnote_backlinks = true
social_media_card = "img/logo.png"
+++

Since this site's files are on [GitHub](https://github.com/welpo/osc.garden/), I thought it would be a nice idea to automatically update it whenever the repository is modified.<!-- more -->

## My Setup

I'm hosting this site ~~on an ARM instance of Oracle's Free Tier~~[^1] on a cheap and realiable Vultr virtual machine.

The site is built with [Zola](https://www.getzola.org/), a fast static site generator. All I need to do to update my site is to grab the latest changes from the repository and run `zola build`. I wrote a simple bash script (`update_osc.garden`) to handle this process:

```bash
#!/usr/bin/env bash
set -eo pipefail

repo="/opt/osc.garden/repo"
out_dir="/var/www/osc.garden"

cd "$repo"
git pull
git submodule update
zola build --output-dir "$out_dir" --force
```

To run it, I made the file executable with `chmod +x update_osc.garden`.

Of course, I could manually run this script whenever I make changes to the site, but automating stuff is way more fun.

## Options

My first idea was to use [`cron`](https://wiki.debian.org/cron) to schedule a job to run the script every few minutes. But that's boring and not very efficient—why waste resources rebuilding the site if there's nothing to update?

I asked GPT-4 for ideas. It suggested: GitHub Actions, webhooks, cron job, manual SFTP, and continuous deployment services.

Cron was already out. SFTP is even worse than cron, and I can't use continuous deployment services or GitHub Actions because I'm self-hosting.

Webhooks sounded like black magic, kind of like push notifications. Time to learn!

## Webhooks

A webhook is a way to tell a server "Hey! It happened! The thing you care about happened! Do your thing!". In other words, whenever I push to my site's repository, GitHub will poke the webhook server, triggering the site update.

I installed a [lightweight Go webhook server](https://github.com/adnanh/webhook) with `sudo apt install webhook`.

Next, I created `hooks.yaml` defining the hook that will execute the script I created earlier:

```YAML
- id: "update-osc.garden"
  execute-command: "/opt/osc.garden/update_osc.garden"
  command-working-directory: "/opt/osc.garden/repo"
```

Now I can run the webhook server with `webhook -hooks hooks.yaml -verbose`. However, before I can actually use it, I need to open the ports.

## Opening the Ports

### Local Firewall

I'm using [ufw](<https://wiki.debian.org/Uncomplicated%20Firewall%20(ufw)>) to manage my firewall. So I ran `sudo ufw allow 9000/tcp` to allow TCP connections on port 9000.

That wasn't enough, though—Oracle has its own firewall. I always forget how to open its ports, so this time I wrote it down, for my future self:

### Oracle Firewall

1. Log in to your [Oracle Cloud Infrastructure console](https://cloud.oracle.com/sign-in).

2. Go to Dashboard → Virtual cloud networks. Open your VCN.

3. Click on your subnet's name.

4. Click on your subnet's security list.

5. Click on "Add Ingress Rules" and fill in the form. Here's what I used:

   - **Source Type**: CIDR
   - **Source CIDR**: 140.82.112.0/20 (I added one Ingress Rule per CIDR IP block in the `hooks` section of [GitHub IP addresses](https://api.github.com/meta))
   - **Source Port Range**: All
   - **Destination Port Range**: 9000
   - **Description**: GitHub webhook

Done!

## Secure Access

### Using SSL Certificates

I wanted to use SSL, so I had to modify the command to use my certificates:

```bash
webhook -secure -hooks hooks.yaml -verbose \
-cert /etc/letsencrypt/live/osc.garden/fullchain.pem \
-key /etc/letsencrypt/live/osc.garden/privkey.pem
```

Now, I can connect to `https://osc.garden:9000/hooks/update-osc.garden` to trigger the script:

```bash
[webhook] 2023/08/27 12:57:40 [38c8b4] executing /opt/osc.garden/update_osc.garden (/opt/osc.garden/update_osc.garden) with arguments ["/opt/osc.garden/update_osc.garden"] and environment [] using /opt/osc.garden/repo as cwd
[webhook] 2023/08/27 12:57:41 [38c8b4] command output: Already up to date.
Building site...
Checking all internal links with anchors.
> Successfully checked 0 internal link(s) with anchors.
-> Creating 15 pages (0 orphan) and 11 sections
Done in 132ms.
```

Nice! Time to secure it and automate it.

### Only GitHub Allowed

Let's update the YAML file to add a "trigger-rule" so that only authorised requests can trigger the build.

```YAML
- id: "update-osc.garden"
  execute-command: "/opt/osc.garden/update_osc.garden"
  command-working-directory: "/opt/osc.garden"
  trigger-rule:
    and:
      - match:
          type: "payload-hmac-sha256"
          secret: "my-super-secret-token"
          parameter:
            source: "header"
            name: "X-Hub-Signature-256"
```

This rule matches a `secret`, which is a password I created.

Now, if I try to trigger it like before, `webhook` complains: `Hook rules were not satisfied.` Great—only requests with the hashed secret will be accepted.

Time to set up the GitHub webhook.

## GitHub Webhook Setup

I went to my repository → Settings → Webhooks → Add webhook, and entered:

- **Payload URL**: `https://osc.garden:9000/hooks/update-osc.garden`
- **Content type**: `application/json`
- **Secret**: `my-super-secret-token`
- **Enable SSL verification**
- **Trigger events**: "Just the `push` event".

I clicked "Add webhook" and pushed a change to the repo. It worked! GitHub notified my webhook server and my site was rebuilt with the changes. Pretty cool.

Almost done! Let's run this webhook server as non-root and create a service for it, so that it's always running.

## Webhook Server Service

### Isolation and Permissions

It's not a good idea to run the webhook server as root, so I created a new user to run it with `sudo adduser webhookuser`. Next, I added this user to a new `sslcerts` group, and set the necessary permissions:

```bash
# Set 'webhookuser' as owner for project and web directories.
sudo chown -R webhookuser:webhookuser /opt/osc.garden
sudo chown -R webhookuser:webhookuser /var/www/osc.garden

# Create sslcerts group and add webhookuser to it.
sudo addgroup sslcerts
sudo usermod -aG sslcerts webhookuser

# Grant read and execute permissions to sslcerts for certificate archives.
sudo chgrp sslcerts /etc/letsencrypt/archive /etc/letsencrypt/archive/osc.garden
sudo chmod 750 /etc/letsencrypt/archive /etc/letsencrypt/archive/osc.garden

# Enable directory traversal for 'others' on SSL certificate directories.
sudo chmod o+x /etc/letsencrypt /etc/letsencrypt/live /etc/letsencrypt/live/osc.garden

# Set the file permissions and group for the actual SSL cert files.
sudo chmod 640 /etc/letsencrypt/live/osc.garden/privkey.pem
sudo chgrp sslcerts /etc/letsencrypt/live/osc.garden/privkey.pem
```

The idea is to minimise the permissions, reducing potential damage from a misconfiguration or security vulnerability.

Here I encountered a problem when running the script as `webhookuser`: Zola tries to remove the directory before building the site—the permissions above are not enough.

While I could give the `webhookuser` permissions on all of `/var/www`, I decided instead to use a temporary directory for the `zola build` command:

```bash,hl_lines=8 19 22
#!/usr/bin/env bash
set -eo pipefail

repo="/opt/osc.garden/repo"
live_dir="/var/www/osc.garden"

# Create a unique temporary directory.
temp_dir=$(mktemp -d)

# Ensure cleanup on exit (successful or otherwise).
trap "rm -rf $temp_dir" EXIT

# Update repo and submodules.
cd "$repo"
git pull
git submodule update

# Build site in temporary directory.
zola build --output-dir "$temp_dir" --force

# Sync files to the live directory.
rsync -a --delete "$temp_dir/" "$live_dir/"
```

### Systemd Service

[Systemd](https://systemd.io/) is the first process that runs on Debian, initialising system settings and managing background tasks ("services" or "daemons"). I decided to use a systemd service file to automate the startup of the webhook server, add logging, further control its privileges, and restart it on failure.

I created this service file with minimal permissions with `sudo vim /etc/systemd/system/webhook.service`:

```.gitconfig
[Unit]
Description=Webhook for updating osc.garden
Documentation=https://github.com/adnanh/webhook/
After=network.target

[Service]
Type=simple
User=webhookuser
ExecStart=/usr/bin/webhook -secure -hooks /opt/osc.garden/hooks.yaml -cert /etc/letsencrypt/live/osc.garden/fullchain.pem -key /etc/letsencrypt/live/osc.garden/privkey.pem -verbose
Restart=on-failure
RestartSec=5s
StandardOutput=journal
StandardError=journal

# Security.
ReadWritePaths=/var/www/osc.garden /opt/osc.garden/repo
ReadOnlyPaths=/etc/letsencrypt/live/osc.garden /opt/osc.garden
CapabilityBoundingSet=
PrivateTmp=true
NoNewPrivileges=true
ProtectHome=true
ProtectSystem=strict
PrivateDevices=true

[Install]
WantedBy=multi-user.target
```

I saved the file, reloaded the daemon, and started it up:

```bash
sudo systemctl daemon-reload
sudo systemctl start webhook.service
```

I can see how the service is doing with `sudo systemctl status webhook` and `sudo journalctl -fu webhook`.

After confirming it worked, I set the service to auto-start on boot with `sudo systemctl enable webhook.service`.

## The Final Script

I added logging, error messages, and my favourite: push notifications to my phone with [`ntfy`](https://ntfy.sh/):

```bash
#!/usr/bin/env bash
set -eo pipefail

repo="/opt/osc.garden/repo"
live_dir="/var/www/osc.garden"

ntfy_url="ntfy.osc.garden/builds"
ntfy_token="my-ntfy-access-token"

send_notification() {
    local tag="$1"
    local title="$2"
    local message="$3"
    ntfy pub -T "$tag" -t "$title" -m "$message" -k "$ntfy_token" "$ntfy_url"
}

trap_cleanup() {
    echo "Removing temporary directory $temp_dir"
    rm -rf "$temp_dir"
    if [ "$1" == "success" ]; then
        last_commit_msg=$(git log -1 --pretty=%B)
        send_notification "seedling" "osc.garden updated" "Last commit: $last_commit_msg"
        echo "osc.garden updated."
    fi
}

notify_failure() {
    send_notification "bangbang" "osc.garden failed to update" "$1"
    echo "Error: $1" >&2
    exit 1
}

# Create a unique temporary directory.
temp_dir=$(mktemp -d) || notify_failure "Failed to create temp directory"

# Ensure cleanup on exit (successful or otherwise).
trap 'trap_cleanup' EXIT

# Update repo and submodules.
echo "Updating repository…"
cd "$repo"
git fetch || notify_failure "Git fetch failed"
git reset --hard origin || notify_failure "Git reset failed"
git pull || notify_failure "Git pull failed"
git submodule update || notify_failure "Git submodule update failed"

# Build site in temporary directory.
echo "Running Zola build…"
zola build --output-dir "$temp_dir" --force || notify_failure "Zola build failed"

# Sync files to the live directory.
echo "Syncing files…"
rsync -a --delete "$temp_dir/" "$live_dir/" || notify_failure "rsync failed"

# Remove trap and show a success message.
trap - EXIT
trap_cleanup success
```

The notifications look like this (click to swap between success and failure):

{{ image_toggler(default_src="img/ntfy_success.webp", toggled_src="img/ntfy_fail.webp", default_alt="ntfy success notification", toggled_alt="ntfy fail notification") }}

And that's it! After tinkering with some new tools, a lot of troubleshooting (damn permissions!), and a good amount of learning, now my website is automatically redeployed whenever its repository is updated. Wonderful!

---

## Extra: On Push Notifications and Webhooks

After learning about the webhook black magic, I researched a bit about push notifications—they're indeed similar to webhooks. However, instead of listening on a port, phones rely on long-lived connections to a notification service. They use a keep-alive mechanism to keep the connection open and when the server has something to notify, it pushes the notification payload over this preexisting connection.

Here's an analogy: webhooks are like your friends sending you a text (a new connection each time) to tell you something. Push notifications are like being on a long voice call with a friend—even when no one is talking, the connection persists. Whenever someone wants to speak up, they use the existing call instead of setting up a new connection. The keep-alive mechanism would be akin to asking, after some minutes of silence, "You there?". "Yeah".

---

[^1]: Oracle deleted my Free Tier account without warning, explanation or recourse (a common practice, it seems). I am now hosting the site on an affordable and reliable Vultr instance I've had for over six years. If you want to try Vultr, here's [my referral signup link](https://www.vultr.com/?ref=7123709), which gets you $100 in credit, while I get $10.
