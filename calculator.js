document.documentElement.className = 'light';

class Calculator {
  #result = ''
  #chain = []
  
  #getLastItem() {
    const [last] = this.#chain.slice(-1);
    return last;
  }
  
  #updateLastNumber(value) {
    const last = this.#getLastItem();
    const index = this.#chain.indexOf(last);
    
    if (!/\d+/g.test(last)) {
      this.#chain.push(parseFloat(value));
      return false;
    }
    
    this.#chain[index] = parseFloat(`${last}${value}`);
  }
  
  #updateResult() {
    let result = this.#chain[0];
  
    for (let i = 1; i < this.#chain.length; i++) {
      const element = this.#chain[i];
      const next = this.#chain[i + 1];
      
      if (typeof element === 'string') {
        if (element === '+') {
          result = next + result;
        }
      }
    }
    
    this.#result = result;
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
    
    const operator = {
      '=': () => {
        this.#updateResult();
        this.#chain = [this.#result];
      },
      c: () => {
        this.#chain = [];
        this.#result = '';
      },
      '+': () => {
        this.#chain.push(value);
      }
    }
    
    if (value in operator) {
      operator[value]();
    }
    
    return false;
  }
  
  result() {
    return this.#result;
  }
  
  chain() {
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
    
    if (value === '=') {
      result.innerHTML = calculator.result();
      
      return;
    }
    
    result.innerHTML = calculator.chain();
    return;
  });
}
