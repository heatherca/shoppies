const filmForm = document.querySelector('.films');
const results = document.querySelector('.results');
const favs = document.querySelector('.favs');


let key = 'here';
let searchResults = [];
let favourites = [];


// api call for search
function apiCall(){
  $.ajax({
    url: `http://www.omdbapi.com/?type=movie&apikey=a1aad806`,
    method: `GET`,
    dataType: `json`,
    data: {
      s: key,
    }
  }).then((result) => {
    searchResults = result.Search
    displayItems();
  });
}

// handle submit 
function handleSubmit(e){
  e.preventDefault();
  const keyword = e.currentTarget.item.value;
  key = keyword;
  apiCall();
  // e.target.reset(); 

  results.dispatchEvent(new CustomEvent('itemsUpdated'));
}

// put items on page <img src="${item.Poster}">
function displayItems() {
  searchResults2 = [...searchResults]
  const html = searchResults2.map(item => `
  <li class="film">
  <img src="${item.Poster}" onerror="this.src='./error.jpg'">
  <span class="itemName">${item.Title}</span>
  <span class="itemYear">${item.Year}</span>
  <button aria-label="favourite ${item.Title}" value="${item.imdbID}">Favourite</button>
  </li>`).join('');
  results.innerHTML = html
}

// when favourite button clicked adds id to favourite id, checks if it exists or favourites list too long
results.addEventListener('click', function (e) {
  const id = e.target.value
  if(favourites.includes(e.target.value)){
    return alert("already favourited!")
  }
  else if(favourites.length >= 5){
    return alert('favourite list full, remove one to add more')
  }
  else if (e.target.matches('button') && !favourites.includes(e.target.value)) {
    console.log(id)
    favourites.push(id)
    console.log('fav click fire')
    favs.dispatchEvent(new CustomEvent('favsUpdated'));
  }
})

// add favourites to favourite section on page 
function apiCall2 (thing){
  $.ajax({
    url: `http://www.omdbapi.com/?type=movie&apikey=a1aad806`,
    method: `GET`,
    dataType: `json`,
    data: {
      i: thing,
    }
  }).then((result) => {
    // console.log(result)
    console.log(result.Poster)
    htmlFav = `<li class="film">
  <img src="${result.Poster}" onerror="this.src='./error.jpg'" >
  <span class="itemName">${result.Title}</span>
  <span class="itemYear">${result.Year}</span>
  <button aria-label="delete ${result.Title}" value="${result.imdbID}">Delete</button>
  </li>`
  favs.insertAdjacentHTML('beforeend', htmlFav)
  // favs.innerHTML = htmlFav
  // favs.dispatchEvent(new CustomEvent('favsUpdated'));
  });
}

// displays favourite films on page 
function displayFavs(){
  console.log('display fire')
  favs.innerHTML= ""
  favourites2 = [...favourites].sort()
  console.log(favourites2)
  favourites2.map(item=> apiCall2(item));  
  // console.log(favourites);
  // best = favourites[favourites.length - 1];
  // console.log('hi')
  // apiCall2(best)
}

// send to local storage for refresh 
function mirrorToLocalStorage() {
  localStorage.setItem('favourites', JSON.stringify(favourites));
  console.log('storing!')
}

// puts favourites back on page if they exist 
function restoreFromLocalStorage() {
  const lsItems = JSON.parse(localStorage.getItem('favourites'))
  console.log("i restored!")

  if (lsItems) {
    favourites.push(...lsItems)
    favs.dispatchEvent(new CustomEvent('favsUpdated'));
    console.log('this works')
  }
}

// remove favourite from list 
function deleteItem(id) {
  favourites = favourites.filter(item => item !== id);
  // console.log(favourites)
  favs.dispatchEvent(new CustomEvent('favsUpdated'))
}

favs.addEventListener('click', function (e) {
  const id = e.target.value
  if (e.target.matches('button')) {
    deleteItem(id)
  }
})

// Click poster to learn more about film 



restoreFromLocalStorage();
displayFavs();


// event listeners 
filmForm.addEventListener('submit', handleSubmit)
favs.addEventListener('favsUpdated', displayFavs)
favs.addEventListener('favsUpdated', mirrorToLocalStorage)
