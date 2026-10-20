import { useEffect, useRef, useState, type FormEvent } from 'react';
import envelope from '../assets/optimized/open-envelope.webp';
import { cooldownRemainingMs, recordSubmission } from '../lib/rateLimit';
import { deliverContact, validateContact, type ContactErrors, type ContactFields } from '../lib/contact';
import { useReveal } from '../lib/useReveal';
import './EnvelopeFooter.css';
const empty:ContactFields={name:'',email:'',phone:'',message:''};
type Status='idle'|'loading'|'success'|'error'|'throttled';

export default function EnvelopeFooter() {
  const root=useReveal();
  const [fields,setFields]=useState<ContactFields>(empty);
  const [errors,setErrors]=useState<ContactErrors>({});
  const [status,setStatus]=useState<Status>('idle');
  const [feedback,setFeedback]=useState('');
  const [wait,setWait]=useState(0);
  const request=useRef<AbortController|null>(null);
  const alive=useRef(true);
  const form=useRef<HTMLFormElement>(null);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;request.current?.abort();};},[]);
  useEffect(()=>{
    if(status!=='throttled')return;
    const timer=setInterval(()=>{
      const remaining=Math.ceil(cooldownRemainingMs()/1000);
      setWait(remaining);
      if(remaining<=0){setStatus('idle');setFeedback('You can send another message now.');}
    },1000);
    return()=>clearInterval(timer);
  },[status]);
  const change=(key:keyof ContactFields,value:string)=>{
    setFields(previous=>({...previous,[key]:value}));
    setErrors(previous=>({...previous,[key]:undefined}));
    if(status==='error'){setStatus('idle');setFeedback('');}
  };
  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(request.current||status==='loading')return;
    const next=validateContact(fields);
    setErrors(next);
    if(Object.keys(next).length){
      setFeedback('Please check the highlighted fields.');setStatus('error');
      form.current?.querySelector<HTMLInputElement|HTMLTextAreaElement>('#contact-'+Object.keys(next)[0])?.focus();
      return;
    }
    const remaining=cooldownRemainingMs();
    if(remaining>0){setWait(Math.ceil(remaining/1000));setStatus('throttled');setFeedback('Please give your last letter a moment before sending another.');return;}
    const controller=new AbortController();request.current=controller;
    const timeout=setTimeout(()=>controller.abort(),15000);
    setStatus('loading');setFeedback('Your letter is on its way…');
    try {
      await deliverContact(fields,controller.signal);
      if(!alive.current)return;
      recordSubmission();setStatus('success');setFeedback('Thank you. Your message has been sent to ACM-W VIT.');
    } catch(error:unknown){
      if(!alive.current)return;
      setStatus('error');setFeedback(controller.signal.aborted?'Delivery is taking too long. Please try again, or email us directly.':error instanceof Error?error.message:'Something went wrong. Please try again.');
    } finally {clearTimeout(timeout);request.current=null;}
  };
  return <footer ref={root} className="contact-section">
    <div className="section-shell contact-layout">
      <div className="contact-intro" data-reveal>
        <p className="eyebrow">08 / YOUR NEXT CHAPTER STARTS HERE</p>
        <h2>Good things<br/>start with<br/><em>a hello.</em></h2>
        <p>An idea, a question, a collaboration.<br/>There’s always room for another conversation.</p>
        <a href="mailto:acm@vit.ac.in" className="text-link">acm@vit.ac.in <span aria-hidden="true">↗</span></a>
        <div className={`contact-envelope ${status==='success'?'contact-envelope--sent':''}`} aria-hidden="true"><img src={envelope} width={700} height={500} loading="lazy" decoding="async" alt=""/><span className="sent-postmark">LETTER<br/>SENT ✓</span></div>
      </div>
      <div className="contact-paper" data-reveal>
        <div className="letter-heading"><span>TO: ACM-W VIT</span><span aria-hidden="true">✳</span></div>
        {status==='success'?<div className="letter-success"><p className="eyebrow">SIGNED, SEALED, DELIVERED.</p><h3>We’re glad<br/>you wrote.</h3><p role="status">{feedback}</p><button type="button" className="text-link" onClick={()=>{setFields(empty);setStatus('idle');setFeedback('');}}>Write another letter <span aria-hidden="true">↗</span></button></div>:<form ref={form} onSubmit={submit} noValidate aria-busy={status==='loading'}>
          <h3>A little note from you.</h3>
          <div className="contact-field-pair">
            <div className="letter-field"><label htmlFor="contact-name">Your name</label><input id="contact-name" name="name" autoComplete="name" required maxLength={100} value={fields.name} onChange={event=>change('name',event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name?'contact-name-error':undefined} placeholder="How should we call you?"/>{errors.name&&<p className="field-error" id="contact-name-error">{errors.name}</p>}</div>
            <div className="letter-field"><label htmlFor="contact-email">Email address</label><input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} value={fields.email} onChange={event=>change('email',event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email?'contact-email-error':undefined} placeholder="So we can write back"/>{errors.email&&<p className="field-error" id="contact-email-error">{errors.email}</p>}</div>
          </div>
          <div className="letter-field"><label htmlFor="contact-phone">Phone <span>(optional)</span></label><input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={30} value={fields.phone} onChange={event=>change('phone',event.target.value)} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone?'contact-phone-error':undefined} placeholder="Include your country code, if needed"/>{errors.phone&&<p className="field-error" id="contact-phone-error">{errors.phone}</p>}</div>
          <div className="letter-field"><label htmlFor="contact-message">What’s on your mind?</label><textarea id="contact-message" name="message" required maxLength={5000} rows={5} value={fields.message} onChange={event=>change('message',event.target.value)} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message?'contact-message-error':undefined} placeholder="Dear ACM-W…"/>{errors.message&&<p className="field-error" id="contact-message-error">{errors.message}</p>}</div>
          <div className="letter-submit"><button type="submit" disabled={status==='loading'||status==='throttled'}>{status==='loading'?'Sending…':status==='throttled'?`Wait ${wait}s`:'Send your letter'}<span aria-hidden="true">↗</span></button><span>A CONVERSATION, NOT A MAILING LIST.</span></div>
          <p className="letter-status" role="status" aria-live="polite" aria-atomic="true">{feedback}</p>
        </form>}
      </div>
    </div>
    <div className="chapter-signoff"><a href="#home" className="signoff-brand">acm-w ✳</a><p>Made with curiosity & a little love.<br/>ACM-W VIT · {new Date().getFullYear()}</p><div><a href="https://www.instagram.com/acmwvit/" target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href="https://www.linkedin.com/company/acmw-vit/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="https://github.com/ACM-VIT" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div><a href="#home" className="back-to-top">BACK TO THE BEGINNING ↑</a></div>
  </footer>;
}
