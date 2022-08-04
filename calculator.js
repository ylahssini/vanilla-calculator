document.documentElement.className = 'light';

class Calculator {
  #result = 0
  #chain = []
  #eventMap = {
    '+': () => {}
  }
  
  #updateLastNumber(value) {
    const [last] = this.#chain.slice(-1);
    const index = this.#chain.indexOf(last);
    
    this.#chain[index] = parseFloat(`${last}${value}`);
  }
  
  setValue(value) {
    const number = parseFloat(value);
    const isNumber = !Number.isNaN(number);
    
    if (isNumber && this.#chain.length === 0) {
      this.#chain.push(number);
      return true;
    }
    
    if (isNumber) {
      this.#updateLastNumber(number);
      return true;
    }
    
    return false;
  }
  
  result() {
    return this.#chain.join(' ');
  }
}

const buttons = document.querySelectorAll('button[data-key]');
const result = document.querySelector('[data-result]');
const sub = document.querySelector('[data-sub]');


const calculator = new Calculator();

for (const button of buttons) {
  button.addEventListener('click', function() {
    const self = this;
    const value = self.getAttribute('data-key');
    
    calculator.setValue(value);
    result.innerHTML = calculator.result();
  });
}
