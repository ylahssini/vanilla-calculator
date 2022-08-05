  document.documentElement.className = 'light';

class Calculator {
  #result = ''
  #chain = []
  
  #getLastItem() {
    const [last] = this.#chain.slice(-1);
    return last;
  }
  
  #isNumber(value) {
    return /\d+/g.test(value);
  }
  
  #updateLastNumber(value) {
    const last = this.#getLastItem();
    const index = this.#chain.lastIndexOf(last);
    
    if (!this.#isNumber(last)) {
      this.#chain.push(parseFloat(value));
      return;
    }
    
    this.#chain[index] = parseFloat(`${last}${value}`);
  }
  
  #updateResult() {
    let chain = this.#chain;
    
    for (let i = 0; i < this.#chain.length; i++) {
      const element = this.#chain[i];

      if (element === '×') {
        const prev = this.#chain[i - 1];
        const next = this.#chain[i + 1];
        
        chain[i + 1] = prev * next;
        chain[i] = undefined;
        chain[i - 1] = undefined;
      }
    }
    
    chain = chain.filter((item) => item !== undefined);
    
    let result = chain[0];
  
    for (let i = 1; i < chain.length; i++) {
      const element = chain[i];
      const next = chain[i + 1];
      
      if (typeof element === 'string') {
        if (element === '+') {
          result = next + result;
        } else if (element === '-') {
          result = result - next;
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
      return;
    }
    
    if (isNumber) {
      this.#updateLastNumber(number);
      return;
    }
    
    if (!isNumber && this.#chain.length === 0) {
      // @todo support ()
      return;
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
      '<-': () => {
        const last = this.#getLastItem();
        const index = this.#chain.lastIndexOf(last);
        
        if (this.#chain.length === 0) {
          return;
        }
        
        if (this.#isNumber(last)) {
          this.#chain[index] = parseFloat(last.toString().slice(0, -1));
          
          console.log(this.#chain);
          
          if (Number.isNaN(this.#chain[index]) && index === 0) {
            this.#chain = [];
          }
          
          if (Number.isNaN(this.#chain[index])) {
            this.#chain = this.#chain.slice(0, index);
          }
          
          return;
        }
        
        this.#chain = this.#chain.slice(0, this.#chain.length - 1);
      },
      '+': () => {
        this.#chain.push(value);
      },
      '-': () => {
        this.#chain.push(value);
      },
      '×': () => {
        this.#chain.push(value);
      }
    }
    
    if (value in operator) {
      operator[value]();
    }
    
    return;
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
