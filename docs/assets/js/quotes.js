const elContent = document.querySelector('.quote-content');
const elAuthor = document.querySelector('.quote-author');

document.addEventListener('DOMContentLoaded', () => {
  fetch('https://api.quotable.io/random')
    .then((response) => response.json())
    .then((data) => {
      elContent.textContent = data.content;
      elAuthor.textContent = '—' + data.author;
    });
});
