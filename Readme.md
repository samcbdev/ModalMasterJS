
# ModalMaster.js Documentation

**ModalMaster.js** is a lightweight, flexible, and stackable jQuery-based modal plugin.  
It supports multiple modals, scroll locking, animations, AJAX content loading, and custom lifecycle hooks.

---

## 📦 Features

- Stackable modals with independent configurations  
- ESC key close & outside click close  
- Scroll lock for background  
- Animation support (fade / slide)  
- AJAX content loading  
- Custom lifecycle callbacks  
- Auto-detects modal-specific settings via `data-*` attributes  

---

## 📁 HTML Structure

```html
<div class="customModal exampleModal"
     data-scroll-lock="true"
     data-esc-to-close="true"
     data-outside-click-close="true"
     data-animation="fade"
     data-animation-speed="300"
     data-modal-stack="true">

  <div class="modalContent">
    <h2>Hello Modal!</h2>
    <button data-close-modal>Close</button>
  </div>
</div>

<!-- Trigger -->
<button class="openModalTrigger" data-modal-target="exampleModal">Open Modal</button>
```

---

## ⚙️ Global Configuration

You can set global modal behavior using:

```js
ModalMaster.setGlobalConfig({
  escToClose: true,
  outsideClickClose: true,
  scrollLock: true,
  animation: 'fade', // 'fade', 'slide', or false
  animationSpeed: 400,
});
```

These settings act as defaults and are overridden by modal-specific `data-*` attributes.

---

## 🧪 Data Attributes (Per Modal)

| Attribute               | Type    | Default | Description                        |
|------------------------|---------|---------|------------------------------------|
| data-esc-to-close      | boolean | false   | Allow closing via ESC key          |
| data-outside-click-close | boolean | false | Allow closing by clicking outside  |
| data-scroll-lock       | boolean | true    | Prevent background scroll          |
| data-animation         | string  | false   | 'fade', 'slide', or false          |
| data-animation-speed   | number  | 300     | Speed in ms for animations         |
| data-modal-stack       | boolean | false   | Push to ESC-close stack            |

---

## 🛠 JavaScript API

### `ModalMaster.open(modalClass)`
Open a modal by its class:

```js
ModalMaster.open('exampleModal');
// or
$('.exampleModal').modalOpen();
```

### `ModalMaster.close(modalClass)`
Close a modal:

```js
ModalMaster.close('exampleModal');
// or
$('.exampleModal').modalClose();
```

### `ModalMaster.openAjax(modalClass, url)`
Loads AJAX content into `.ajaxTarget` inside the modal and opens it:

```js
ModalMaster.openAjax('ajaxModal', '/path/to/content.html');
```

### `ModalMaster.on(modalClass, eventName, callback)`
Listen to modal lifecycle events:

```js
ModalMaster.on('exampleModal', 'modal:open', function () {
  console.log('Modal opened');
});
// or
$('.exampleModal').on('modal:open', function () {
  console.log('Modal opened');
});
```

---

## 📡 Modal Lifecycle Events

Each modal triggers the following events (usable via `.on()` or inline):

| Event             | When it Fires                    |
|------------------|----------------------------------|
| modal:beforeOpen | Before the modal is opened       |
| modal:open       | After modal becomes visible      |
| modal:stacked    | If pushed to modal stack         |
| modal:ajaxLoad   | AJAX load starts                 |
| modal:ajaxSuccess| AJAX load successful             |
| modal:ajaxError  | AJAX load failed                 |
| modal:beforeClose| Before modal begins closing      |
| modal:close      | After modal is closed            |
| modal:unstacked  | Removed from ESC-close stack     |

---

## 🔁 Callbacks (Hooks)

Register custom callbacks per modal:

```js
ModalMaster.registerCallbacks('exampleModal', {
  beforeOpen: ($modal) => console.log('Opening', $modal),
  onOpen: ($modal) => console.log('Opened'),
  beforeClose: ($modal) => console.log('Closing'),
  onClose: ($modal) => console.log('Closed')
});
```

---

## 🔄 Stack Behavior

If a modal has `data-modal-stack`, it is:

- Pushed to `ModalMaster.stack`
- Closed by pressing ESC (if `data-esc-to-close="true"` is set)
- Removed from stack on close

This ensures only the topmost modal responds to ESC.

---

## 🧱 Animation

Supported animations:

- `fade`: Fades modal in/out  
- `slide`: Slides modal in/out  
- `false`: Instant show/hide (default)  

Speed controlled by `data-animation-speed`.

---

## 🔲 Outside Click to Close

If `data-outside-click-close="true"`, clicking outside `.modalContent` will close the modal, unless:

- The modal just opened (debounced for 150ms)  
- Click started or ended inside `.modalContent`  

---

## 🔐 ESC Key Close

If `data-esc-to-close="true"`:

- Modal will close on pressing Escape  
- Only the last stacked modal will respond  

---

## 🌀 Scroll Lock

If `data-scroll-lock="true"`:

- Body gets `.modalOpen` and `.stopScroll` classes  
- Removed once all modals are closed  

---

## 🔄 Custom Triggers

Use:

```html
<button class="openModalTrigger" data-modal-target="exampleModal">Open</button>
```

To open the modal using delegated click listener.

---

## ❌ Close Triggers

Use:

```html
<button data-close-modal>Close</button>
```

Inside the modal to close it.

---

## 🌐 AJAX Example

```html
<div class="customModal ajaxModal">
  <div class="modalContent">
    <div class="ajaxTarget"></div>
    <button data-close-modal>Close</button>
  </div>
</div>

<script>
  // Load and open content
  ModalMaster.openAjax('ajaxModal', '/demo/content.html');
</script>
```

---

## 🧯 Manual Modal Control

You can also manually control modals:

```js
$('.exampleModal').modalOpen();
$('.exampleModal').modalClose();
```

---

## 🧪 Debug Tips

- Inspect the `ModalMaster.stack` in dev tools  
- Use `ModalMaster.getConfig($modal, 'escToClose')` to check effective config  
- Attach `.on('modal:*')` events for logging  

---

## ✅ Final Notes

- Requires jQuery (3.5+ recommended)  
- Self-contained — no CSS needed unless you want custom modal styling  
- Fully extensible for transitions, focus trap, accessibility, etc.  
