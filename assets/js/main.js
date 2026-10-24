(() => {
 const cfg=window.ZYQEN_CONFIG||{};
 const $=(s,r=document)=>r.querySelector(s);
 const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
 const year=$('#year'); if(year) year.textContent=new Date().getFullYear();
 const toggle=$('.menu-toggle'),nav=$('.nav');
 if(toggle&&nav) toggle.addEventListener('click',()=>nav.classList.toggle('open'));
 $$('.nav a').forEach(a=>a.addEventListener('click',()=>nav?.classList.remove('open')));
 const countries=["India","United States","United Kingdom","United Arab Emirates","Canada","Australia","Singapore","Pakistan","Bangladesh","Nepal","Sri Lanka","Germany","France","Japan","Other"];
 $$('#countrySelect, .country-select').forEach(sel=>countries.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;sel.appendChild(o)}));
 $$('[data-service]').forEach(a=>a.addEventListener('click',()=>{const s=$('#serviceForm select[name="service"]');if(s)s.value=a.dataset.service}));
 function status(form,msg,error=false){const el=$('.form-status',form);if(el){el.textContent=msg;el.classList.toggle('error',error)}}
 async function sendToSheets(payload){
   const endpoint=cfg.GOOGLE_SHEETS_ENDPOINT;
   if(!endpoint||endpoint.includes('PASTE_')) throw new Error('The Google Sheets endpoint is not configured yet. Please set it in assets/js/config.js.');
   // Apps Script accepts a simple POST body; no custom headers to avoid preflight.
   await fetch(endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),redirect:'follow'});
   // no-cors is used because Apps Script web apps do not provide normal browser CORS headers.
   // The browser cannot read the response, so users should verify rows in the Sheet during setup tests.
   return true;
 }
 $$('form[data-form-type]').forEach(form=>form.addEventListener('submit',async e=>{
   e.preventDefault();const type=form.dataset.formType;
   if(type==='academic'){handleAcademic(form);return}
   const btn=$('button[type="submit"]',form);btn.disabled=true;const old=btn.innerHTML;btn.textContent='Sending…';status(form,'');
   const data=Object.fromEntries(new FormData(form).entries());data.formType=type;data.submittedAt=new Date().toISOString();
   try{await sendToSheets(data);form.reset();status(form,'Thanks! Your details have been submitted.');}
   catch(err){status(form,err.message||'Something went wrong. Please try again.',true)}
   finally{btn.disabled=false;btn.innerHTML=old}
 }));
 const grid=$('#programGrid'),modal=$('#registrationModal');
 if(grid&&Array.isArray(window.ZYQEN_PROGRAMS)) {
   grid.innerHTML=window.ZYQEN_PROGRAMS.map(p=>`<article class="program-card"><div class="program-art"><span class="program-symbol">${escapeHtml(p.symbol||'✳')}</span><span class="program-tag">${escapeHtml(p.category||'PROGRAM')}</span></div><div class="program-body"><div class="program-meta"><span>◷ ${escapeHtml(p.duration||'Flexible')}</span><span>▣ ${escapeHtml(p.format||'Online')}</span></div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description)}</p><ul class="program-outcomes">${(p.outcomes||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul><div class="program-meta"><span>📅 ${escapeHtml(p.date||'Date to be announced')}</span></div><div class="program-bottom"><div class="program-price"><b>₹${Number(p.fee||100)}</b><small>Registration fee</small></div><button class="btn btn-primary register-btn" data-program-id="${escapeHtml(p.id)}">Register ↗</button></div></div></article>`).join('');
   $$('.register-btn',grid).forEach(b=>b.addEventListener('click',()=>openRegistration(b.dataset.programId)));
 }
 const closeModal=()=>{modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true');document.body.style.overflow=''};
 $('.modal-close')?.addEventListener('click',closeModal);
 modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
 function openRegistration(id){
   const p=(window.ZYQEN_PROGRAMS||[]).find(x=>x.id===id);if(!p)return;
   const f=$('#academicForm');f.elements.programId.value=p.id;f.elements.programTitle.value=p.title;
   $('#modalTitle').textContent='Register for a program';$('#modalProgramSummary').textContent=`${p.title} · ${p.date} · ₹${p.fee} INR`;
   status(f,'');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
 }
 async function handleAcademic(form){
   const btn=$('button[type="submit"]',form),old=btn.innerHTML;btn.disabled=true;btn.textContent='Preparing secure payment…';status(form,'');
   const data=Object.fromEntries(new FormData(form).entries());data.formType='academic';data.submittedAt=new Date().toISOString();
   try{
     if(!cfg.PAYMENT_API_BASE||cfg.PAYMENT_API_BASE.includes('PASTE_')) throw new Error('Payments are not configured yet. Please contact the site administrator.');
     if(!cfg.RAZORPAY_KEY_ID||cfg.RAZORPAY_KEY_ID.includes('PASTE_')) throw new Error('Razorpay Key ID is not configured yet.');
     const orderRes=await fetch(cfg.PAYMENT_API_BASE.replace(/\/$/,'')+'/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({programId:data.programId,programTitle:data.programTitle,amount:10000,currency:'INR',email:data.email,phone:data.phone,fullName:data.fullName})});
     const order=await orderRes.json();if(!orderRes.ok||!order.id)throw new Error(order.error||'Unable to create payment order.');
     const options={key:cfg.RAZORPAY_KEY_ID,amount:order.amount,currency:order.currency||'INR',name:'Zyqen Technologies',description:data.programTitle,order_id:order.id,prefill:{name:data.fullName,email:data.email,contact:data.phone},theme:{color:'#3c82ff'},
       handler:async function(payment){try{
         const verifyRes=await fetch(cfg.PAYMENT_API_BASE.replace(/\/$/,'')+'/verify-payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payment,registration:data})});
         const result=await verifyRes.json();if(!verifyRes.ok||!result.success)throw new Error(result.error||'Payment verification failed.');
         try{await sendToSheets({...data,paymentId:payment.razorpay_payment_id,orderId:payment.razorpay_order_id,paymentStatus:'PAID',paidAmount:'100 INR'})}catch(sheetErr){console.error(sheetErr);status(form,'Payment verified, but registration sheet submission failed. Please contact the site administrator.',true);return}
         form.reset();status(form,'Payment successful! Your registration has been submitted.');setTimeout(closeModal,1800);
       }catch(err){status(form,err.message||'Payment verification failed. Please contact support.',true)}},
       modal:{ondismiss:()=>status(form,'Payment window closed. You can try again.')},
     };
     const checkout=new Razorpay(options);checkout.on('payment.failed',r=>status(form,r.error?.description||'Payment failed. Please try again.',true));checkout.open();
   }catch(err){status(form,err.message||'Could not start payment.',true)}
   finally{btn.disabled=false;btn.innerHTML=old}
 }
 function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 const jobs=$('#jobsList'),roleSelect=$('#careerRole');
 if(jobs&&Array.isArray(window.ZYQEN_JOBS)){
   jobs.innerHTML=window.ZYQEN_JOBS.map(j=>`<article class="job-item"><div><span class="job-type">${escapeHtml(j.type)}</span><h3>${escapeHtml(j.title)}</h3><div class="job-meta">${escapeHtml(j.location)} · ${escapeHtml(j.employment)}</div></div><p>${escapeHtml(j.description)}</p><a class="btn btn-ghost apply-role" href="#careerForm" data-role="${escapeHtml(j.title)}">Apply now ↗</a></article>`).join('');
   if(roleSelect)window.ZYQEN_JOBS.forEach(j=>{const o=document.createElement('option');o.value=j.title;o.textContent=j.title;roleSelect.appendChild(o)});
   $$('.apply-role').forEach(a=>a.addEventListener('click',()=>{if(roleSelect)roleSelect.value=a.dataset.role}));
 }
})();