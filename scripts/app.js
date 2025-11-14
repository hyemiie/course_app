 
 new Vue({
  el: '#app',
  data: {
lessond: [ 
    { id: 1, subject: 'Quantum Mechanics', location: 'Cardiff', price: 92, spaces: 5, icon: 'fas fa-theater-masks' , img_url:"https://plus.unsplash.com/premium_photo-1690297853326-e127726588ac?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fHBoeXNpY3N8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600" }, 
    { id: 2, subject: 'English', location: 'Oxford', price: 90, spaces: 5, icon: 'fas fa-book', img_url:"https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=822" }, 
    { id: 3, subject: 'Science', location: 'Cambridge', price: 110, spaces: 5, icon: 'fas fa-flask' , img_url:"https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870" }, 
    { id: 4, subject: 'History', location: 'Manchester', price: 85, spaces: 5, icon: 'fas fa-landmark' , img_url:"https://images.unsplash.com/photo-1637073849563-5b0ac780ec34?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870" },
     { id: 5, subject: 'Data Science', location: 'Brighton', price: 95, spaces: 5, icon: 'fas fa-palette' , img_url:"https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHRlY2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600" },
      { id: 6, subject: 'Music', location: 'Liverpool', price: 105, spaces: 5, icon: 'fas fa-music' , img_url:"https://images.unsplash.com/photo-1686161238569-f32e92b6c363?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=869" }, 
      { id: 7, subject: 'Cloud Computing', location: 'Leeds', price: 80, spaces: 5, icon: 'fas fa-running', img_url:"https://plus.unsplash.com/premium_photo-1733317290375-d39da9fcc8e3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1032" },
       { id: 8, subject: 'Computer Science', location: 'Bristol', price: 120, spaces: 5, icon: 'fas fa-laptop-code', img_url:"https://images.unsplash.com/photo-1630324311529-a4027ab19d37?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870" },
        { id: 9, subject: 'Robotics Engineering', location: 'Edinburgh', price: 88, spaces: 5, icon: 'fas fa-globe' , img_url:"https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBoeXNpY3N8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600" },
         { id: 10, subject: 'Drama', location: 'London', price: 100, spaces: 5, icon: 'fas fa-calculator', img_url:"https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870" },
    ],
    lessons :[],
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
    filteredLessons() {
      if (!this.searchQuery.trim()) return this.lessons;
      const query = this.searchQuery.toLowerCase();
      return this.lessons.filter(lesson =>
        lesson.subject.toLowerCase().includes(query) ||
        lesson.location.toLowerCase().includes(query) ||
        String(lesson.price).includes(query) ||
        String(lesson.spaces).includes(query)
      );
    },
    sortedLessons() {
      let lessons = [...this.filteredLessons];
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
    cartTotal() {
      return this.cart.reduce((sum, item) => sum + item.price, 0);
    }
  },
  methods: {
    addToCart(lesson) {
      if (lesson.spaces > 0) {
        this.cart.push({ ...lesson });
        lesson.spaces--;
      }
    },
    removeFromCart(index) {
      const item = this.cart[index];
      const originalLesson = this.lessons.find(l => l.id === item.id);
      if (originalLesson) originalLesson.spaces++;
      this.cart.splice(index, 1);
      if (this.cart.length === 0) this.showCart = false;
    },
    submitOrder() {
      this.orderSubmitted = true;
      setTimeout(() => {
        this.cart = [];
        this.checkoutName = '';
        this.checkoutPhone = '';
        this.orderSubmitted = false;
        this.showCart = false;
      }, 3000);
    },
      retrieveData() {
  fetch("http://localhost:5000/api/lessons/")
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      this.lessons = data
      console.log("Lessons retrieved:", this.lessons);

    
    })
    .catch(error => {
      console.error("Error fetching lessons:", error);
    });
},

searchWord() {
  const word = this.searchQuery.trim();

  fetch(`http://localhost:5000/api/lessons/search/${encodeURIComponent(word)}`, {
    method: "GET"
  })
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
}

  },

 
  mounted() {
  this.retrieveData(); 
}

});
