document.documentElement.className = 'light';

const buttons = document.querySelectorAll('button[data-key]');

for (const button of buttons) {
  button.addEventListener('click', function() {
    const self = this;
    console.log(self.getAttribute('data-key'))
  });
}
