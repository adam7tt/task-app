const {calculateTip, fahrenheitToCelsius, celsiusToFahrenheit, add }= require('../src/math')

test('Calculates a new bill amount given tip and bill', () => {
    const total = calculateTip(10, .3)
    expect(total).toBe(13)
})

test('Should calculate total with default tip', () => {
    const total = calculateTip(10)
    expect(total).toBe(12)
})

test('Should convert 32 F to 0 C', () => {
    const converted = fahrenheitToCelsius(32)
    expect(converted).toBe(0)
})

test('Should convert 0 C to 32 F', () => {
    const converted = celsiusToFahrenheit(0)
    expect(converted).toBe(32)
})

test('asyn', (done) => {
    setTimeout(() => {
        expect(1).toBe(1)
        done()
    }, 200)
})

test('add', (done) => {
    add(2,3).then((sum) => {
        expect(sum).toBe(5)
        done()
    })
})

test('add', async () => {
    const sum = await add(2,3)
    expect(sum).toBe(5)
})