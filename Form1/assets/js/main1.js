function Validator(options) {
    var selectorRules = {}
    function validate(inputElement, rule) {
        var errMess
        var errElement = inputElement.parentElement.querySelector(options.errorSelector)
        var rules = selectorRules[rule.selector]

        for(var i = 0; i < rules.length; i++) {
            errMess = rules[i](inputElement.value)
            if(errMess) {break}
        }

        if(errMess) {
            errElement.innerText = errMess
            inputElement.parentElement.classList.add('invalid')
        } else {
            errElement.innerText = ''
            inputElement.parentElement.classList.remove('invalid')
        }
        return !errMess
    }
    var formElement = document.querySelector(options.form)
    if(formElement) {

        formElement.onsubmit = function(e) {
            e.preventDefault()
            var isFormValid = true
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if(!isValid) {
                    isFormValid = false
                }
            })
            if(isFormValid) {
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        values[input.name] = input.value
                        return values
                    }, {})
                    options.onSubmit({formValues})
                } 
                else {
                    formElement.submit()
                }
            }
        }

        options.rules.forEach(function(rule) {

            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElement = formElement.querySelector(rule.selector)
            if(inputElement) {

                // Khi blur ra ngoai input
                inputElement.onblur = function() {
                    var errElement = inputElement.parentElement.querySelector(options.errorSelector)
                    validate(inputElement, rule)
                }

                // Khi nhap gia tri vao input
                inputElement.oninput = function() {
                    var errElement = inputElement.parentElement.querySelector(options.errorSelector)
                    errElement.innerText = ''
                    inputElement.parentElement.classList.remove('invalid')
                }
            }
        })
    }
}

Validator.isRequire = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : 'Vui long nhap lai'
        }
    }
}

Validator.isEmail = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Vui long nhap lai email'
        }
    }
}

Validator.minLength = function(selector, min) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : `Vui long nhap toi thieu ${min} ky tu`
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : 'Vui long nhap lai mat khau'
        }
    }
}