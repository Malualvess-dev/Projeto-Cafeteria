// js/carrinho.js
document.addEventListener('DOMContentLoaded', () => {
  const qs  = (s, sc=document)=> sc.querySelector(s);
  const qsa = (s, sc=document)=> [...sc.querySelectorAll(s)];
  const money = v => (v ?? 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

  // Estado inicial: lê do localStorage, ou vazio
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('aurora:cart')) || []; }
  catch { cart = []; }

  // Referências de painéis
  const panes = {
    1: qs('#pane-cart'),
    2: qs('#pane-address'),
    3: qs('#pane-payment'),
    4: qs('#pane-review')
  };
  let step = 1;
  const setStep = n => {
    step = n;
    Object.values(panes).forEach(p=>p.classList.add('hidden'));
    panes[n].classList.remove('hidden');
    qsa('.step').forEach(el=> el.classList.toggle('active', Number(el.dataset.step)===n));
  };

  // Render do carrinho
  function renderCart(){
    const list = qs('#cartList');
    list.innerHTML = '';

    if (!cart.length) {
      list.innerHTML = `
        <p class="muted">Seu carrinho está vazio. </p>
        <p><a class="btn" href="/index.html">Ir ao cardápio</a></p>
      `;
      renderSummary();
      persist();
      return;
    }

    cart.forEach(item=>{
      const html = `
        <div class="cart-item">
          <div class="thumb">
            <img src="${item.img || 'images/placeholder.jpg'}" alt="${item.name}">
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
              <strong>${item.name}</strong>
              <button class="remove" aria-label="Remover" data-rm="${item.id}">remover</button>
            </div>
            <div class="qty" style="margin-top:6px">
              <button data-dec="${item.id}">−</button>
              <span>${item.qty}</span>
              <button data-inc="${item.id}">+</button>
            </div>
          </div>
          <strong>${money((item.price||0)*(item.qty||1))}</strong>
        </div>`;
      list.insertAdjacentHTML('beforeend', html);
    });

    bindCart();
    renderSummary();
    persist();
  }

  function bindCart(){
    // Incremento
    qsa('[data-inc]').forEach(b=>{
      b.onclick = ()=>{
        const it = cart.find(i=> i.id === b.dataset.inc);
        if (!it) return;
        it.qty = (it.qty||1) + 1;
        renderCart();
      };
    });

    // Decremento (mínimo 1)
    qsa('[data-dec]').forEach(b=>{
      b.onclick = ()=>{
        const it = cart.find(i=> i.id === b.dataset.dec);
        if (!it) return;
        it.qty = Math.max(1, (it.qty||1) - 1);
        renderCart();
      };
    });

    // Remover
    qsa('[data-rm]').forEach(b=>{
      b.onclick = ()=>{
        cart = cart.filter(i=> i.id !== b.dataset.rm);
        renderCart();
        toast('Removido do carrinho');
      };
    });
  }

  function persist(){
    localStorage.setItem('aurora:cart', JSON.stringify(cart));
  }

  // Resumo
  function renderSummary(){
    const rows = qs('#sum-rows');
    rows.innerHTML = '';
    let sub = 0;

    cart.forEach(i=>{
      const lineTotal = (i.price||0) * (i.qty||1);
      sub += lineTotal;
      rows.insertAdjacentHTML('beforeend',
        `<div class="row"><span>${i.name} × ${i.qty||1}</span><span>${money(lineTotal)}</span></div>`
      );
    });

    const ship = cart.length ? 5 : 0;
    qs('#sum-sub').textContent   = money(sub);
    qs('#sum-ship').textContent  = money(ship);
    qs('#sum-total').textContent = money(sub + ship);
  }

  // Toast simples
  function toast(text){
    const el = qs('#toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    setTimeout(()=> el.classList.remove('show'), 1800);
  }

  // Etapas
  qs('#toAddress')?.addEventListener('click', ()=>{
    if (!cart.length) return toast('Carrinho vazio');
    setStep(2);
  });

  qs('#toPayment')?.addEventListener('click', ()=>{
    setStep(3);
  });

  qs('#toReview')?.addEventListener('click', ()=>{
    fillReview();
    setStep(4);
  });

  qsa('[data-back]').forEach(b=> b.addEventListener('click', ()=>{
    setStep(Math.max(1, step-1));
  }));

  // Pagamento — alternar abas
  qsa('.opt').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      qsa('.opt').forEach(o=> o.classList.remove('active'));
      btn.classList.add('active');
      const k = btn.dataset.pay;
      qsa('.pay-pane').forEach(p=> p.classList.add('hidden'));
      qs('#pay-'+k)?.classList.remove('hidden');
    });
  });

  // Revisão
  function fillReview(){
    const rev = qs('#reviewData');
    const addrIds = ['nome','cep','rua','numero','bairro','cidade','uf','complemento'];
    const addr = addrIds
      .map(id => ({ id, val: qs('#'+id)?.value?.trim() || '' }));

    const pay = qs('.opt.active')?.dataset.pay || 'pix';
    const items = cart.map(i=> `${i.name}×${i.qty||1}`).join(', ');

    let html = '';
    html += `<p><strong>Pagamento:</strong> ${pay.toUpperCase()}</p>`;
    html += `<p><strong>Itens:</strong> ${items || '-'}</p>`;
    addr.forEach(a=>{
      html += `<p><strong>${a.id.toUpperCase()}:</strong> ${a.val || '-'}</p>`;
    });

    rev.innerHTML = html;
  }

  // Confirmar
  qs('#confirmOrder')?.addEventListener('click', ()=>{
    if (!cart.length) return toast('Carrinho vazio');
    toast('Pedido confirmado!');

    // Limpa carrinho e volta para a home
    localStorage.removeItem('aurora:cart');
    setTimeout(()=> { window.location.href = '/index.html'; }, 1500);
  });

  // Inicializa interface
  renderCart();
});
