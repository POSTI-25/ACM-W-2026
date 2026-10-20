import { useState } from 'react';
import { blogs } from '../data/blogs';
import fallback from '../assets/optimized/blog-cover.webp';
import { useReveal } from '../lib/useReveal';

export default function BlogStamps() {
  const root=useReveal();
  const [current,setCurrent]=useState(0);
  const count=blogs.length;
  const offsets=count>2?[-1,0,1]:count===2?[0,1]:[0];
  return <div ref={root} className="reading-room section-shell">
    <div className="reading-heading" data-reveal>
      <div className="section-intro"><p className="eyebrow">04 / THE READING ROOM</p><h2>Ideas worth<br/><em>passing on.</em></h2></div>
      <p className="section-deck">Thoughts, discoveries, and a few rabbit holes.<br/>From the minds of our community.</p>
    </div>
    {count ? <>
      <div className="blog-fan" key={current}>
        {offsets.map(offset=>{
          const post=blogs[(current+offset+count)%count];
          return <article key={post.id} className={`reading-stamp ${offset===0?'reading-stamp--active':offset<0?'reading-stamp--before':'reading-stamp--after'}`}>
            <div className="reading-stamp__paper">
              <img className="reading-cover" src={post.image} alt="" width={640} height={420} loading="lazy" decoding="async" onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src=fallback;}}/>
              <div className="reading-stamp__copy">
                <p className="reading-meta">{post.date}<span>{post.read}</span></p>
                <h3>{post.title}</h3>
                <p className="reading-author">By {post.author}</p>
                <p className="reading-excerpt">{post.body}</p>
                <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-link" aria-label={`Read ${post.title} (opens in a new tab)`}>Read story <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </article>;
        })}
      </div>
      <div className="editorial-controls">
        <button type="button" className="round-arrow" disabled={count<2} onClick={()=>setCurrent(value=>(value-1+count)%count)} aria-label="Previous stories">←</button>
        <p role="status" aria-live="polite">{String(current+1).padStart(2,'0')} <span>/ {String(count).padStart(2,'0')}</span></p>
        <button type="button" className="round-arrow" disabled={count<2} onClick={()=>setCurrent(value=>(value+1)%count)} aria-label="Next stories">→</button>
      </div>
    </>:<p className="blog-empty">Our next story is on its way. <a href="https://blog.acmvit.in/">Visit the chapter blog ↗</a></p>}
  </div>;
}
