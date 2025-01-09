class NumberKeyPadCardrd extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: #f9f9f9;
                    border-radius: 15px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    width: 100%;
                    max-width: 260px;
                    margin: auto;
                }
                .display {
                    font-size: 2em;
                    margin: 10px 0;
                    text-align: right;
                    padding: 10px;
                    border: 2px solid #ccc;
                    background: #ffffff;
                    border-radius: 10px;
                    width: 100%;
                    max-width: 260px;
                    height: 60px;
                    box-sizing: border-box;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-family: 'Arial', sans-serif;
                    font-weight: bold;
                    color: #333;
                }
                .keypad {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                }
                .button {
                    font-size: 1.2em;
                    padding: 15px;
                    text-align: center;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                }
                .button:hover {
                    background: #0056b3;
                }
                .button:active {
                    transform: scale(0.95);
                    background: #003f7f;
                }
                .button.special {
                    background: #dc3545;
                }
                .button.special:hover {
                    background: #b02a37;
                }
                .button.special:active {
                    background: #801f29;
                }
            </style>
            <div class="container">
                <div class="display" id="display"></div>
                <div class="keypad">
                    <button class="button" data-key="1">1</button>
                    <button class="button" data-key="2">2</button>
                    <button class="button" data-key="3">3</button>
                    <button class="button" data-key="4">4</button>
                    <button class="button" data-key="5">5</button>
                    <button class="button" data-key="6">6</button>
                    <button class="button" data-key="7">7</button>
                    <button class="button" data-key="8">8</button>
                    <button class="button" data-key="9">9</button>
                    <button class="button special" data-key="清除">清除</button>
                    <button class="button" data-key="0">0</button>
                    <button class="button special" id="submit">确认</button>
                </div>
            </div>
        `;

        // 将 _handleButtonClick 绑定到实例属性，确保引用一致
        this._handleButtonClick = this._handleButtonClick.bind(this);
    }

    setConfig(config) {
        this.config = config;
    }

    set hass(hass) {
        this._hass = hass;
    }

    connectedCallback() {
        this.display = this.shadowRoot.querySelector('#display');
        
        // 确保只绑定一次事件监听器
        this.shadowRoot.querySelectorAll('.button').forEach(button => {
            button.removeEventListener('click', this._handleButtonClick); // 确保移除旧监听器
            button.addEventListener('click', this._handleButtonClick);  // 添加新监听器
        });
    }

    _handleButtonClick(event) {
        const key = event.target.dataset.key;

        if (key === '清除') {
            // 清空输入
            this.display.textContent = '';
            this.display.style.fontSize = '2em'; // 恢复默认字体大小
        } else if (key === undefined) {
            // 发布数字到 MQTT
            this._publishNumber();
        } else {
            // 添加数字到显示框
            if (this.display.textContent === '') {
                this.display.textContent = key;
            } else {
                this.display.textContent += key;
            }

            // 动态调整字体大小
            if (this.display.textContent.length > 10) {
                this.display.style.fontSize = '1.5em';
            }
            if (this.display.textContent.length > 15) {
                this.display.style.fontSize = '1em';
            }
        }
    }

    _publishNumber() {
        const number = this.display.textContent;

        if (this._hass && this.config.mqtt_topic) {
            // 调用 Home Assistant 的 MQTT 服务
            this._hass.callService('mqtt', 'publish', {
                topic: this.config.mqtt_topic,
                payload: number.toString() // 确保以字符串形式发送
            });
            // 清空输入框
            this.display.textContent = '';
            this.display.style.fontSize = '2em'; // 恢复默认字体大小
        } else {
            console.error('Hass object or mqtt_topic is not defined.');
        }
    }

    getCardSize() {
        return 3;
    }
}

customElements.define('number-keypad-card', NumberKeyPadCardrd);
