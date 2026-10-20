import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deliverContact, validateContact, type ContactFields } from '../src/lib/contact.ts';
const fields:ContactFields={name:'  A visitor  ',email:'reader@example.com',phone:'',message:'  Hello, chapter!  '};
const signal=()=>new AbortController().signal;
const response=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
test('phone is genuinely optional; whitespace-only required fields are rejected',()=>{
  assert.deepEqual(validateContact(fields),{});
  const errors=validateContact({...fields,name:'  ',message:'\n',email:'invalid'});
  assert.deepEqual(Object.keys(errors).sort(),['email','message','name']);
});
test('international display formatting is accepted without stripping the country prefix',()=>{
  assert.deepEqual(validateContact({...fields,phone:'+91 98765 43210'}),{});
  assert.ok(validateContact({...fields,phone:'123'}).phone);
});
test('the accepted request preserves text, trims outer whitespace, and uses the same-origin endpoint',async()=>{
  let payload:unknown;
  const mock:typeof fetch=async(input,init)=>{
    assert.equal(input,'/api/contact');assert.equal(init?.signal?.aborted,false);
    payload=JSON.parse(String(init?.body));
    return response({message:'Email sent successfully'});
  };
  await deliverContact(fields,signal(),mock);
  assert.deepEqual(payload,{name:'A visitor',email:'reader@example.com',phone:'',message:'Hello, chapter!'});
});
test('a successful HTML SPA fallback is never reported as sent',async()=>{
  await assert.rejects(deliverContact(fields,signal(),async()=>new Response('<html>app</html>',{headers:{'content-type':'text/html'}})),/could not be delivered/);
});
test('unexpected JSON acknowledgements are rejected',async()=>{
  await assert.rejects(deliverContact(fields,signal(),async()=>response({message:'Not a delivery acknowledgement'})),/could not confirm/);
});
test('provider errors and rate limiting produce actionable feedback',async()=>{
  await assert.rejects(deliverContact(fields,signal(),async()=>response({},502)),/could not be delivered/);
  await assert.rejects(deliverContact(fields,signal(),async()=>response({},429)),/wait a moment/);
});
test('cancellation is passed through to the request rather than becoming a false success',async()=>{
  const controller=new AbortController();controller.abort();
  await assert.rejects(deliverContact(fields,controller.signal,async(_input,init)=>{
    init?.signal?.throwIfAborted();return response({message:'Email sent successfully'});
  }),{name:'AbortError'});
});
