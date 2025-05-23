// Đối tượng Validator
function Validator(options) {

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
 
    var selectorRules = {};

    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        // var errorElement = inputElement.parentElement.querySelector(options.errorSelector)
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);

        // var errorMessage = rule.test(inputElement.value);
        var errorMessage;

        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        // Lặp qua từng rule và kiểm tra
        // Nếu có lỗi dừng việc kiểm tra
        for(var i = 0; i < rules.length; ++i) {
            // errorMessage = rules[i](inputElement.value)
            switch(inputElement.type) {
                case 'radio':
                       
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if(errorMessage) {
                break; 
            }
        }

        if(errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);
    if(formElement) {

        // Khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            // Lặp qua từng rule và validate
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(!isValid) {
                    isFormValid = false;
                }
            })

            if(isFormValid) {

                // Trường hợp submit với JS
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')) {
                                    values[input.name] = ''
                                    return values;
                                } 
                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.file
                                break;
                            default:
                                values[input.name] = input.value

                        } 
                        // values[input.name] = input.value;
                        return values;
                    }, {})
                    options.onSubmit({formValues});
                }

                // Trường hợp submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            }
        }

        // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input, ...)
        options.rules.forEach(function(rule){

            // Lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            

            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function(inputElement) { 
                // Xử lý trường hợp mỗi khi blur khỏi input
                inputElement.onblur = function() {
                    // value: inputElement.value
                    // test func: rule.test
                    validate(inputElement, rule);
                }

                // Xử lý mỗi khi người dùng nhập vào input
                var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                inputElement.oninput = function() {
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            })

            // if(inputElement) {

            //     // Xử lý trường hợp mỗi khi blur khỏi input
            //     inputElement.onblur = function() {
            //         // value: inputElement.value
            //         // test func: rule.test
            //         validate(inputElement, rule)
            //     }

            //     // Xử lý mỗi khi người dùng nhập vào input
            //     var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
            //     inputElement.oninput = function() {
            //         errorElement.innerText = ''
            //         getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
            //     }
            // }
       })
    }
}

// Định nghĩa rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi: trả ra mess lỗi
// 2. Khi hợp lệ: undefined
Validator.isRequire =  function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : message || 'Vui lòng nhập trường này';
        }
    }

}

Validator.isEmail =  function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Vui lòng nhập email';
        }
    }
} 

Validator.minLength =  function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`;
        }
    }
}  

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}