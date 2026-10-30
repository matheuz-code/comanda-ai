export const catalog = Object.freeze([
 {id:'burger',name:'Burger da casa',category:'Lanches',description:'Pão, hambúrguer, queijo e salada. Exemplo fictício.',price:2490,icon:'🍔'},
 {id:'veggie',name:'Burger veggie',category:'Lanches',description:'Hambúrguer vegetal, queijo e folhas. Exemplo fictício.',price:2290,icon:'🥬'},
 {id:'fries',name:'Batata crocante',category:'Porções',description:'Porção individual de batatas. Exemplo fictício.',price:1290,icon:'🍟'},
 {id:'juice',name:'Suco de laranja',category:'Bebidas',description:'Copo de 300 ml. Exemplo fictício.',price:790,icon:'🍊'},
 {id:'water',name:'Água mineral',category:'Bebidas',description:'Garrafa de 500 ml. Exemplo fictício.',price:490,icon:'💧'},
 {id:'brownie',name:'Brownie',category:'Sobremesas',description:'Chocolate e uma pausa doce. Exemplo fictício.',price:1090,icon:'🍫'}
]);
export function items(cart) {
 if(!cart || typeof cart !== 'object' || Array.isArray(cart)) throw Error('Carrinho inválido.');
 return Object.entries(cart).map(([id,quantity])=>{
  const product=catalog.find(p=>p.id===id);
  if(!product || !Number.isInteger(quantity) || quantity<1 || quantity>20) throw Error('Quantidade deve estar entre 1 e 20.');
  return {...product,quantity,subtotal:product.price*quantity};
 });
}
export const total = cart => items(cart).reduce((sum,p)=>sum+p.subtotal,0);
export function makeOrder(cart,table,id,date=new Date().toISOString()) {
 const list=items(cart);
 if(!list.length) throw Error('Adicione um produto antes de finalizar.');
 if(!Number.isInteger(table)||table<1||table>99) throw Error('Informe uma mesa entre 1 e 99.');
 return {id,date,table,items:list,total:total(cart),status:'Recebido'};
}
export const states=['Recebido','Em preparo','Pronto','Concluído'];
export function changeStatus(order,next) {
 if(!states.includes(order.status)||states.indexOf(next)!==states.indexOf(order.status)+1) throw Error('Transição de status inválida.');
 return {...order,status:next};
}
export const money = cents => (cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
