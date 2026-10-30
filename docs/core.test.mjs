import test from 'node:test';import assert from 'node:assert/strict';import {total,makeOrder,changeStatus} from './core.mjs';
test('totais em centavos e quantidades',()=>{assert.equal(total({burger:2,water:1}),5470);assert.equal(total({}),0);});
test('rejeita itens e quantidades inválidas',()=>{for(const c of [{fake:1},{burger:0},{burger:1.5},{burger:21}])assert.throws(()=>total(c));});
test('finalização exige carrinho e mesa válida',()=>{assert.throws(()=>makeOrder({},1,'x'));for(const n of [0,100,1.2,NaN])assert.throws(()=>makeOrder({burger:1},n,'x'));assert.equal(makeOrder({burger:1},2,'x').status,'Recebido');});
test('cozinha exige transições sequenciais',()=>{const o=makeOrder({water:1},1,'x');assert.equal(changeStatus(o,'Em preparo').status,'Em preparo');assert.throws(()=>changeStatus(o,'Pronto'));});
