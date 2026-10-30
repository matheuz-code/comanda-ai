import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrder } from '../utils/order-validation.mjs';
const catalog = [{id:'burger',name:'Burger',price:'24.90',active:true}];
test('server catalog overrides forged price and total', () => {
  const result = validateOrder([{id:'burger',quantity:2,price:0,total:-100,name:'Falso'}],catalog);
  assert.equal(result.total,49.8); assert.equal(result.items[0].name,'Burger');
});
test('rejects unknown and inactive products', () => {
  assert.throws(()=>validateOrder([{id:'fake'}],catalog));
  assert.throws(()=>validateOrder([{id:'burger'}],[{...catalog[0],active:false}]));
});
test('rejects invalid quantities', () => {
  for (const quantity of [0,-1,1.5,Infinity,100]) assert.throws(()=>validateOrder([{id:'burger',quantity}],catalog));
});
test('combines repeated items without bypassing quantity limits', () => {
  assert.equal(validateOrder([{id:'burger',quantity:2},{id:'burger',quantity:3}],catalog).items[0].quantity,5);
  assert.throws(()=>validateOrder([{id:'burger',quantity:60},{id:'burger',quantity:60}],catalog));
});
test('rejects empty orders and invalid catalog prices', () => {
  assert.throws(()=>validateOrder([],catalog));
  assert.throws(()=>validateOrder([{id:'burger'}],[{...catalog[0],price:-1}]));
});
