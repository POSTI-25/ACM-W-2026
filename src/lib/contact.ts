export interface ContactFields { name:string; email:string; phone:string; message:string }
export type ContactErrors=Partial<Record<keyof ContactFields,string>>;
export function validateContact(fields:ContactFields):ContactErrors {
  const errors:ContactErrors={};
  if(!fields.name.trim())errors.name='Please tell us your name.';
  else if(fields.name.trim().length>100)errors.name='Please keep your name under 100 characters.';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())||fields.email.trim().length>254)errors.email='Please enter a valid email address.';
  if(fields.phone.trim()){
    const digits=fields.phone.replace(/\D/g,'');
    if(!/^[+()\d\s.-]+$/.test(fields.phone)||digits.length<10||digits.length>15||fields.phone.length>30)errors.phone='Use 10–15 digits, with an optional country code.';
  }
  if(!fields.message.trim())errors.message='What would you like to share with us?';
  else if(fields.message.trim().length>5000)errors.message='Please keep your message under 5,000 characters.';
  return errors;
}
/** An HTML SPA fallback is not an email-delivery acknowledgement. */
export async function deliverContact(fields:ContactFields,signal:AbortSignal,fetcher:typeof fetch=fetch):Promise<void> {
  const response=await fetcher('/api/contact',{
    method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},signal,
    body:JSON.stringify(Object.fromEntries(Object.entries(fields).map(([key,value])=>[key,value.trim()]))),
  });
  if(response.status===429)throw new Error('A few too many letters at once. Please wait a moment and try again.');
  if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw new Error('Your message could not be delivered. Please try again, or email us directly.');
  const body:unknown=await response.json();
  if(!body||typeof body!=='object'||!('message' in body)||body.message!=='Email sent successfully')throw new Error('We could not confirm delivery. Please try again, or email us directly.');
}
