const filmForm = document.querySelector('.films');
const results = document.querySelector('.results');
const favs = document.querySelector('.favs');
const main = document.querySelector('main');
const modal = document.querySelector('.modal');
const modalInner = document.querySelector('.modalInner');
const nomStatus = document.querySelector('.nomStatus')

let key = 'here';
let searchResults = [];
let favourites = [];
let filmOpen = '';

// handle submit 
function handleSubmit(e){
  e.preventDefault();
  const keyword = e.currentTarget.searchMovies.value;
  key = keyword;
  apiCall();
}

// api call for search
function apiCall(){
  $.ajax({
    url: `https://www.omdbapi.com/?type=movie&apikey=a1aad806`,
    method: `GET`,
    dataType: `json`,
    data: {
      s: key,
    }
  }).then((result) => {
    searchResults = result.Search
    document.querySelector('.resultsSection').setAttribute("style", "min-height: 40vh")
    if (searchResults == undefined){
      results.innerHTML = `<p class="noResults">No Results. Try Again!</p>`
      document.querySelector('.resultsSection').scrollIntoView()
    } else {
      displayItems();
    }
  });
}

// put items on page
function displayItems() {
  searchResults2 = [...searchResults]
  const html = searchResults2.map(item => `
  <li class="film">
  <img src="${item.Poster}" alt="movie poster of ${item.Title} press enter for details" onerror="this.src='./error.jpg'" name="${item.imdbID}" tabindex="0">
  <p class="itemInfo">${item.Title} (${item.Year})</p>
  <button aria-label="nominate ${item.Title}" value="${item.imdbID}">Nominate</button>
  </li>`).join('');
  results.innerHTML = html
  document.querySelector('.resultsSection').scrollIntoView()
  results.dispatchEvent(new CustomEvent('itemsUpdated'));
}

// if movie already in favourites disable button aria-disabled= true and replace inner text with nominated 
function checkResults (){
  const resultsLi = document.querySelectorAll('.results button')
  resultsLi.forEach(buttonGood)
  function buttonGood(button) {
    if (favourites.includes(button.value)) {
      button.setAttribute('aria-disabled', 'true')
      button.innerHTML = 'Nominated!';
      // button.setAttribute('background-color', '#4B5832')
      button.setAttribute("style", "background-color: #4B5832;")
    }
  }
}

// when favourite button clicked adds id to favourite id, checks if it exists or favourites list too long
results.addEventListener('click', function (e) {
  const id = e.target.value
  if(favourites.includes(e.target.value)){
    return alert("Already nominated!")
  }
  else if (e.target.matches('button') && favourites.length >= 5){
    return alert('Nomination list full, remove one to add more.')
  }
  else if (e.target.matches('button') && !favourites.includes(e.target.value)) {
    favourites.push(id)
    
    favs.dispatchEvent(new CustomEvent('favsUpdated'));
    results.dispatchEvent(new CustomEvent('itemsUpdated'));
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
    htmlFav = `<li class="film">
  <p class="itemInfo">${result.Title} (${result.Year})</p>
  <img src="${result.Poster}" alt="movie poster of ${result.Title} press enter for details" onerror="this.src='./error.jpg'" name="${result.imdbID}" tabindex="0">
  <button aria-label="delete ${result.Title}" value="${result.imdbID}">Delete</button>
  </li>`
  favs.insertAdjacentHTML('beforeend', htmlFav)
  });
}

// displays favourite films on page 
function displayFavs(){
  favs.innerHTML= ""
  favourites2 = [...favourites].sort()
  favourites2.map(item=> apiCall2(item));  
}

// send to local storage for refresh 
function mirrorToLocalStorage() {
  localStorage.setItem('favourites', JSON.stringify(favourites));
}

// puts favourites back on page if they exist 
function restoreFromLocalStorage() {
  const lsItems = JSON.parse(localStorage.getItem('favourites'))

  if (lsItems) {
    favourites.push(...lsItems)
    favs.dispatchEvent(new CustomEvent('favsUpdated'));
  }
}

// remove favourite from list 
function deleteItem(id) {
  favourites = favourites.filter(item => item !== id);

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
    htmlDetails = `
      <img src="${result.Poster}" alt="movie poster of ${result.Title}" onerror="this.src='./error.jpg'" name="${result.imdbID}" tabindex="0">
      <div>
        <h3>${result.Title} (${result.Year})</h3>
        <p>${result.Plot}</p>
        <p>Director: ${result.Director}</p>
        <p>Cast: ${result.Actors}</p>
        <p>IMDb Rating: ${result.imdbRating}</p>
        <a href="https://www.imdb.com/title/${result.imdbID}/">Go to imdb Page</a>
      </div>
    `
    modalInner.innerHTML = htmlDetails
    filmOpen = `${result.imdbID}`
    openModal();
  });
}

main.addEventListener('click', function (e) {
  const id = e.target.name
  if (e.target.matches('img')) {
    apiCallDetails(id);
  }
})

main.addEventListener('keyup', function (e) {
  const id = e.target.name
  if (e.key === 'Enter' && e.target.matches('img')) {
    apiCallDetails(id);
  }
})

// open modal 
function openModal() {
  if (modal.matches('.open')) {
    console.info('modal already open');
    return;
  }
  modal.classList.add('open')
  modal.querySelector('a').focus();

  window.addEventListener('keyup', handleKeyUp);
}

// close modal 
function closeModal() {
  modal.classList.remove('open');
  main.querySelector(`[name="${filmOpen}"]`).focus();
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

// Nominee Count change message and buttons in header depending on how many nominess there are
function nomCount(){
  count = favourites.length
  if (count === 4) {
    return nomStatus.innerHTML = `${5 - count} nomination left!`
  }
  else if (count < 5) {
    return nomStatus.innerHTML = `${5 - count} nominations left!`
  }
  else{
    nomStatus.innerHTML = `Nomination list full! Check your nominees.`
  }
}


restoreFromLocalStorage();
displayFavs();
nomCount();


// event listeners 
filmForm.addEventListener('submit', handleSubmit)
results.addEventListener('itemsUpdated', checkResults)
favs.addEventListener('favsUpdated', displayFavs)
favs.addEventListener('favsUpdated', mirrorToLocalStorage)
modal.addEventListener('click', handleClickOutside);
favs.addEventListener('favsUpdated', nomCount)