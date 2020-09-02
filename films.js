const filmForm = document.querySelector('.films');
const results = document.querySelector('.results');
const favs = document.querySelector('.favs');
const search = document.querySelector('.search');
const modal = document.querySelector('.modal');
const modalInner = document.querySelector('.modalInner');

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
    if (searchResults == undefined){
      console.log('oh no!')
      noResults();
    } else {
      displayItems();
    }
  });
}

// handle submit 
function handleSubmit(e){
  e.preventDefault();
  const keyword = e.currentTarget.searchMovies.value;
  key = keyword;
  apiCall();

  results.dispatchEvent(new CustomEvent('itemsUpdated'));
}

// put items on page <img src="${item.Poster}">
function displayItems() {
  searchResults2 = [...searchResults]
  const html = searchResults2.map(item => `
  <li class="film">
  <img src="${item.Poster}" alt="movie poster of ${item.Title}" onerror="this.src='./error.jpg'" name="${item.imdbID}" >
  <span class="itemName">${item.Title}</span>
  <span class="itemYear">${item.Year}</span>
  <button aria-label="favourite ${item.Title}" value="${item.imdbID}">Favourite</button>
  </li>`).join('');
  results.innerHTML = html
}

// display no results message if no search results
function noResults(){
  const htmlError = `<p>No Results. Try Again!</p>`
  results.innerHTML = htmlError
}

// when favourite button clicked adds id to favourite id, checks if it exists or favourites list too long
results.addEventListener('click', function (e) {
  const id = e.target.value
  if(favourites.includes(e.target.value)){
    return alert("already favourited!")
  }
  else if (e.target.matches('button') && favourites.length >= 5){
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
    htmlFav = `<li class="film">
  <img src="${result.Poster}" alt="movie poster of ${result.Title}" onerror="this.src='./error.jpg'" name="${result.imdbID}" tabindex="0">
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
  // console.log("i restored!")

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
function apiCallDetails(thing){
  $.ajax({
    url: `http://www.omdbapi.com/?type=movie&apikey=a1aad806`,
    method: `GET`,
    dataType: `json`,
    data: {
      i: thing,
    }
  }).then((result)=>{
    console.log(result)
    htmlDetails = `
      <h2>${result.Title}(${result.Year})</h2>
      <img src="${result.Poster}" alt="movie poster of ${result.Title}" onerror="this.src='./error.jpg'" name="${result.imdbID}" tabindex="0">
      <p>${result.Plot}</p>
      <p>Director: ${result.Director}</p>
      <p>Cast: ${result.Actors}</p>
      <p>IMDb Rating: ${result.imdbRating}</p>
      <a href="https://www.imdb.com/title/${result.imdbID}/">Go to imdb Page</a>
    `
    modalInner.innerHTML = htmlDetails
    openModal();
  });
}

search.addEventListener('click', function (e) {
  const id = e.target.name
  if (e.target.matches('img')) {
    apiCallDetails(id);
    // openModal();
  }
})

search.addEventListener('keyup', function (e) {
  const id = e.target.name
  if (e.key === 'Enter' && e.target.matches('img')) {
    apiCallDetails(id);
    // openModal();
  }
})

// open modal 
function openModal() {
  // first need to check if modal is open 
  if (modal.matches('.open')) {
    console.info('modal already open');
    return;
  }
  modal.classList.add('open')

  // event listeners bound to open modal 
  window.addEventListener('keyup', handleKeyUp);
}

function closeModal() {
  modal.classList.remove('open');
  window.removeEventListener('keyup', handleKeyUp);
}

function handleKeyUp(event) {
  if (event.key === 'Escape') return closeModal();
}

function handleClickOutside(e) {
  if (e.target === e.currentTarget) {
    closeModal();
  }
}



restoreFromLocalStorage();
displayFavs();


// event listeners 
filmForm.addEventListener('submit', handleSubmit)
favs.addEventListener('favsUpdated', displayFavs)
favs.addEventListener('favsUpdated', mirrorToLocalStorage)
modal.addEventListener('click', handleClickOutside);