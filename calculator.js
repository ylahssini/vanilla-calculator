const mode = localStorage.getItem('mode');

document.documentElement.className = mode || 'light';

const numberEffect = new Audio('audio/number-effect.mp3');
const operatorEffect = new Audio('audio/operator-effect.mp3');
const themeEffect = new Audio('audio/theme-effect.mp3');

class Calculator {
  #result = ''
  #operation = ''
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
      if (last === ')') {
        this.#chain.push('×')
      }

      this.#chain.push(parseFloat(value));
      return;
    }

    this.#chain[index] = `${last}${value}`;
  }

  #updateChainBetweenParentheses(list) {
    let chain = list;

    for (let i = 0; i < list.length; i++) {
      const element = list[i];

      if (element === ')') {
        let subchain = [];
        let subindex = [];
        let result = 0;

        for (let j = i; j >= 0; j--) {
          if (list[j] === '(') {
            subindex.push(j);
            break;
          }

          subchain.push(list[j]);
          subindex.push(j);
        }

        subchain = this.#updateChainByHighOperator(subchain.reverse(), '×');
        subchain = this.#updateChainByHighOperator(subchain, '÷');
        result = this.#updateChainByOperator(subchain);

        for (const index of subindex) {
          chain[index] = undefined;
        }

        chain[i] = result;
      }
    }

    return chain.filter((item) => (
      item !== undefined
    ));
  }

  #updateChainByOperator(chain) {
    let result = parseFloat(chain[0]);

    for (let i = 1; i < chain.length; i++) {
      const element = chain[i];
      const next = parseFloat(chain[i + 1]);

      if (typeof element === 'string') {
        if (element === '+') {
          result = next + result;
        } else if (element === '-') {
          result = result - next;
        }
      }
    }

    return result;
  }

  #updateChainByHighOperator(list, operator) {
    let chain = list;

    for (let i = 0; i < chain.length; i++) {
      const element = chain[i];

      if (element === operator) {
        const prev = parseFloat(chain[i - 1]);
        const next = parseFloat(chain[i + 1]);

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
    this.#operation = this.#chain.join(' ');

    let chain = this.#updateChainBetweenParentheses(this.#chain);
    chain = this.#updateChainByHighOperator(chain, '×');
    chain = this.#updateChainByHighOperator(chain, '÷')

    this.#result = this.#updateChainByOperator(chain);
  }

  setValue(value) {
    const number = parseFloat(value);
    const isNumber = !Number.isNaN(number);

    if (isNumber && this.#chain.length === 0) {
      numberEffect.play();
      this.#chain.push(number);
      return;
    }

    if (isNumber) {
      numberEffect.play();

      if (this.#operation) {
        this.#chain = [];
      }

      this.#updateLastNumber(number);
      return;
    }

    const last = this.#getLastItem();
    const index = this.#chain.lastIndexOf(last);

    const operator = {
      '=': () => {
        if (!this.#isNumber(last) && last !== ')') {
          this.#chain.pop();
        }
        
        const openParentheses = this.#chain.filter((el) => el === '(');
        const closeParentheses = this.#chain.filter((el) => el === ')');
        
        if (openParentheses.length > closeParentheses.length) {
          this.#chain.push(')');
        }

        this.#updateResult();

        if (this.#isNumber(this.#result)) {
          this.#chain = [this.#result];
        } else {
          this.#result = '';
          this.#chain = [];
        }
      },
      c: () => {
        this.#chain = [];
        this.#result = '';
        this.#operation = '';
      },
      '<-': () => {
        if (this.#chain.length === 0) {
          return;
        }

        if (this.#isNumber(last)) {
          this.#chain[index] = last.toString().slice(0, -1);

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
        if (!this.#isNumber(last)) {
          return;
        }

        const hasDot = last.toString().includes('.');

        if (this.#chain.length === 0 || hasDot) {
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

          this.#chain[index] = parseFloat(`-${this.#chain[index]}`);
        }
      },
      '()': () => {
        if (last === '(') {
          return;
        }

        const openParentheses = this.#chain.filter((el) => el === '(');
        const closeParentheses = this.#chain.filter((el) => el === ')');

        if (openParentheses.length > closeParentheses.length) {
          this.#chain.push(')');

          return;
        }

        if (openParentheses.length < closeParentheses.length) {
          this.#chain.push('(');
          return;
        }

        if (this.#isNumber(last)) {
          this.#chain.push('×');
        }
        
        if (last === ')') {
          this.#chain.push('×');
        }

        this.#chain.push('(');
      },
      action: () => {
        if (last === '(') {
          return;
        }
        
        if (last === ')') {
          this.#chain.push(value);
          return;
        }
        
        if (!this.#isNumber(last)) {
          this.#chain[index] = value;
          return;
        }

        this.#chain.push(value);
      },
    }

    if ('+-×÷'.includes(value)) {
      operatorEffect.play();
      operator.action();
      return;
    }

    if (value in operator) {
      operatorEffect.play();
      operator[value]();
    }

    return;
  }

  result() {
    return this.#result;
  }
  
  operation() {
    return this.#operation;
  }

  chain() {
    return this.#chain.join(' ');
  }
}

const buttons = document.querySelectorAll('button[data-key]');
const result = document.querySelector('[data-result]');
const operation = document.querySelector('[data-operation]');

const calculator = new Calculator();

for (const button of buttons) {
  button.addEventListener('click', function() {
    const value = this.getAttribute('data-key');

    if (calculator.operation() !== '') {
      calculator.setValue('c');
      operation.innerHTML = '';
    }

    calculator.setValue(value);

    if (value === '=') {
      result.innerHTML = typeof calculator.result() === 'number' ? calculator.result() : '';
      operation.innerHTML = calculator.operation();

      return;
    }

    result.innerHTML = calculator.chain();
  });
}

const themes = document.querySelectorAll('button[data-theme]');

for (const theme of themes) {
  theme.addEventListener('click', function () {
    const value = this.getAttribute('data-theme');

    themeEffect.play();

    document.documentElement.className = value;
    localStorage.setItem('mode', value);
  });
}

document.addEventListener('keydown', (event) => {
  const { key } = event;

  if (calculator.operation() !== '') {
    document.querySelector('[data-key="c"]').click();
  }
  
  if(/\d+/g.test(key) || '+-.×÷c'.includes(key)) {
    document.querySelector(`[data-key="${key.toLowerCase()}"]`).click();
  }

  const mapping = {
    '(': () => document.querySelector('[data-key="()"]').click(),
    ')': () => document.querySelector('[data-key="()"]').click(),
    ',': () => document.querySelector('[data-key="."]').click(),
    '*': () => document.querySelector('[data-key="×"]').click(),
    '/': () => document.querySelector('[data-key="÷"]').click(),
    'Backspace': () => document.querySelector('[data-key="<-"]').click(),
  }

  if (key in mapping) {
    mapping[key]();
  }
  
  if (['=', 'Enter'].includes(key)) {
    document.querySelector('[data-key="="]').click();
    return;
  }
  
  result.innerHTML = calculator.chain();
});
