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
  
  #updateChainByHighOperator(list, operator) {
    let chain = list;

    for (let i = 0; i < chain.length; i++) {
      const element = chain[i];
    
      if (element === operator) {
        const prev = chain[i - 1];
        const next = chain[i + 1];

        if (operator === '×') {
          chain[i + 1] = prev * next;
        } else if (operator === '÷') {
          chain[i + 1] = prev / next;
        }

        chain[i] = undefined;
        chain[i - 1] = undefined;
      }
    }
    
    chain = chain.filter((item) => item !== undefined);
    
    return chain;
  }
  
  #updateResult() {
    let chain = this.#updateChainByHighOperator(this.#chain, '×');
    chain = this.#updateChainByHighOperator(chain, '÷')
    
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
    
    const last = this.#getLastItem();
    const index = this.#chain.lastIndexOf(last);
    
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
        if (this.#chain.length === 0) {
          return;
        }
        
        if (this.#isNumber(last)) {
          this.#chain[index] = parseFloat(last.toString().slice(0, -1));
          
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
      '.': () => {
        const hasDot = last.toString().includes('.');

        if (this.#chain.length ===0 || hasDot) {
          return;
        }

        this.#chain[index] = `${this.#chain[index].toString()}.`;
      },
      '+/-': () => {
        if (this.#isNumber(last)) {
          if (last.toString().includes('-')) {
            this.#chain[index] = last.toString().replace(/^-/g, '');
            return;
          }
          
          this.#chain[index] = `-${this.#chain[index]}`;
        }
      },
      '()': () => {
        
      },
      action: () => {
        if (!this.#isNumber(last)) {
          return;
        }
        this.#chain.push(value);
      },
    }
    
    if ('+-×÷'.includes(value)) {
      operator.action();
      return;
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
