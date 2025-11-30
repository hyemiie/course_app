new Vue({
  el: '#app',
  data: {
    lessons: [],
    searchQuery: '',
    sortBy: '',
    sortOrder: 'asc',
    cart: [],
    showCart: false,
    checkoutName: '',
    checkoutPhone: '',
    orderSubmitted: false
  },

  computed: {
    sortedLessons() {
      let lessons = [...this.lessons];
      if (this.sortBy) {
        lessons.sort((a, b) => {
          let valA = a[this.sortBy];
          let valB = b[this.sortBy];

          if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
          }

          return this.sortOrder === 'asc'
            ? valA > valB ? 1 : valA < valB ? -1 : 0
            : valA < valB ? 1 : valA > valB ? -1 : 0;
        });
      }
      return lessons;
    },

    isNameValid() {
      return /^[A-Za-z\s]+$/.test(this.checkoutName);
    },

    isPhoneValid() {
      return /^[0-9]+$/.test(this.checkoutPhone);
    },

    canCheckout() {
      return this.checkoutName && this.checkoutPhone && this.isNameValid && this.isPhoneValid;
    },

    cartCount() {
      return this.cart.reduce((sum, item) => sum + (item.count || 1), 0);
    },

    cartTotal() {
      return this.cart.reduce((sum, item) => sum + item.price, 0);
    }
  },

  methods: {
  addToCart(lesson) {
  if (lesson.spaces <= 0) {
    console.log("No spaces left");
    return;
  }

  const cartItem = this.cart.find(item => item._id === lesson._id);

  if (cartItem) {
    // Item already in cart — increase count
    if (cartItem.count < 5 && lesson.spaces > 0) {
      cartItem.count += 1;
      cartItem.computed_price = cartItem.count * cartItem.price;
      lesson.spaces -= 1;
    } else {
      console.log("Cannot add more than available spaces or 5 per order");
      return;
    }

    // Update existing order
    fetch(`https://lessons-server-1a7x.onrender.com/api/orders/${lesson._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        count: cartItem.count,
        computed_price: cartItem.computed_price
      }),
    })
    .then(res => res.json())
    .then(updatedOrder => console.log("Order updated:", updatedOrder))
    .catch(err => console.error("Error updating order:", err));

  } else {
    // New item being added to cart
    const newCartItem = {
      ...lesson,
      count: 1,
      computed_price: lesson.price * 1   // ✅ computed price even at count 1
    };

    this.cart.push(newCartItem);
    lesson.spaces -= 1;

    // Create new order
    fetch("https://lessons-server-1a7x.onrender.com/api/orders/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCartItem),
    })
    .then(res => res.json())
    .then(createdOrder => console.log("Order created:", createdOrder))
    .catch(err => console.error("Error creating order:", err));
  }

  // Update lesson spaces
  fetch(`https://lessons-server-1a7x.onrender.com/api/lessons/${lesson._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ spaces: lesson.spaces }),
  })
  .then(res => res.json())
  .then(updatedLesson => console.log("Lesson spaces updated:", updatedLesson))
  .catch(err => console.error("Error updating lesson:", err));
},
removeFromCart(lesson) {
  console.log("Removing lesson:", lesson);

  const originalLesson = this.lessons.find(l => l.id === lesson.id);

  if (originalLesson) {
    originalLesson.spaces++;
  }
  console.log("Updated original lesson:", originalLesson);

  if (lesson.count > 1) {
    lesson.count -= 1; 

    fetch(`https://lessons-server-1a7x.onrender.com/api/orders/${lesson._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: lesson.count, computed_price:lesson.count * lesson.price })
    })
      .then(orderDeleteResponse => {
      console.log("Order deleted:", orderDeleteResponse);
      return fetch(`https://lessons-server-1a7x.onrender.com/api/lessons/${lesson._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaces: originalLesson.spaces })
      });
    })
    .then(res => res.json())
    .then(updated => console.log("Order count updated:", updated))
    .catch(err => console.error("Error updating count:", err));

  } else {
    fetch(`https://lessons-server-1a7x.onrender.com/api/orders/${lesson._id}`, {
      method: "DELETE"
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error while deleting order: ${response.status}`);
      }
      return response.json();
    })
    .then(orderDeleteResponse => {
      console.log("Order deleted:", orderDeleteResponse);
      return fetch(`https://lessons-server-1a7x.onrender.com/api/lessons/${lesson._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaces: originalLesson.spaces })
      });
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error while updating lesson: ${response.status}`);
      }
      return response.json();
    })
    .then(updatedLesson => {
      console.log("Lesson updated:", updatedLesson);
    })
    .catch(err => {
      console.error("Error:", err);
    });

    const index = this.cart.findIndex(item => item.id === lesson.id);
    if (index !== -1) this.cart.splice(index, 1);

    if (this.cart.length === 0) {
      this.showCart = false;
    }
  }
},


submitOrder() {
  const orderInfo = {
    name: this.checkoutName,
    phone: this.checkoutPhone,
    lessonIDs: this.cart.map(item => item.id),
    spaces: this.cart.map(item => item.count)
  };

  fetch("https://lessons-server-1a7x.onrender.com/api/order_info/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(orderInfo)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(async (data) => {
      console.log("Order saved:", data);

      for (const item of this.cart) {
        const id = item._id;

        await fetch(`https://lessons-server-1a7x.onrender.com/api/orders/${id}`, {
          method: "DELETE"
        })
        .then(r => r.json())
        .then(result => {
          console.log("Deleted:", id, result);
        })
        .catch(err => console.error("Delete error:", err));
      }
      this.orderSubmitted = true;
      this.checkoutName = '';
      this.checkoutPhone = '';

      setTimeout(() => {
        this.orderSubmitted = false;
        this.cart = [];
        this.showCart = false;


      }, 3000);
    })
    .catch(error => {
      console.error("Error submitting order:", error);
    });
},
   retrieveData() {
      fetch("https://lessons-server-1a7x.onrender.com/api/lessons/")
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {

          this.lessons = data;
          console.log("Lessons retrieved:", this.lessons);
        })
        .catch(error => {
          console.error("Error fetching lessons:", error);
        });
    },

    searchWord() {
      const word = this.searchQuery.trim();

      fetch(`https://lessons-server-1a7x.onrender.com/api/lessons/search/${encodeURIComponent(word)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          this.lessons = data.data;
          console.log("Search response:", data);
        })
        .catch(err => {
          console.error("Search error:", err);
        });
    },

    getCartOrder() {
      fetch('https://lessons-server-1a7x.onrender.com/api/orders/')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          this.cart = data;
          console.log("Cart response:", data);
        })
        .catch(err => {
          console.error("Search error:", err);
        });
    }
  },

  mounted() {
    this.retrieveData();
    this.getCartOrder();
  }
});
