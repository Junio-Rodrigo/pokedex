document.addEventListener('DOMContentLoaded', () => {
    const API = 'https://pokeapi.co/api/v2/pokemon/'
    const buttonSearch = document.querySelector('.searchButton')
    const input = document.querySelector('.searchInput')
    const pokemonsDiv = document.querySelector('.pokemons')
    const buttonMoreView = document.querySelector('.viewMore')
    const favorites = document.querySelector('.favorites')
    const titleFavorite = document.querySelector('.titleFavorite')
    const title = document.querySelector('.title')
    const toggleMode = document.querySelector('#toggleMode')
    let currentOffset = 0

    function darkMode() {
        localStorage.setItem('dark', true)
        if (localStorage.getItem('white')) {
            localStorage.removeItem('white')
        }

        toggleMode.style.backgroundColor = 'transparent'
        const body = document.body
        body.style.backgroundColor = '#121212'
        body.style.color = '#fff'

        title.style.color = '#fff'
        titleFavorite.style.color = '#fff'

        const folhasDeEstilo = document.styleSheets;

        const folha = folhasDeEstilo[0];

        for (let i = 0; i < folha.cssRules.length; i++) {
            const regra = folha.cssRules[i];

            if (regra.selectorText === '.pokemonDiv') {
                regra.style.backgroundColor = '#222';  // Alterar a cor de fundo
                regra.style.color = '#fff';
                regra.style.border = 'none';
            }
            if (regra.selectorText === '.name') {
                regra.style.color = '#fff';
                regra.style.textDecoration = 'underline #222';
            }
        }

        return true
    }

    function cleanMode() {
        localStorage.setItem('white', true)
        if (localStorage.getItem('dark')) {
            localStorage.removeItem('dark')
        }

        toggleMode.style.backgroundColor = '#121212'
        const body = document.body
        body.style.backgroundColor = '#f4f4f4'
        body.style.color = '#000'

        title.style.color = '#000'
        titleFavorite.style.color = '#000'
        
        const folhasDeEstilo = document.styleSheets;

        const folha = folhasDeEstilo[0];

        for (let i = 0; i < folha.cssRules.length; i++) {
            const regra = folha.cssRules[i];

            if (regra.selectorText === '.pokemonDiv') {
                regra.style.backgroundColor = '#f0f0f0';  // Alterar a cor de fundo
                regra.style.color = '#000';
                regra.style.border = 'solid 2px #000';
            }
            if (regra.selectorText === '.name') {
                regra.style.color = '#000'
                regra.style.textDecoration = 'underline #f0f0f0';
            }
        }
        return false
    }

    function favoriteSystem(favorite, copyPokemon, poke) {
        let click = true
        favorite.onclick = e => {
            if (click) {
                click = false
                favorite.style.backgroundColor = 'gold'
                copyPokemon.childNodes[2].style.backgroundColor = 'gold'

                favorites.appendChild(copyPokemon)

                titleFavorite.style.display = 'block'

                localStorage.setItem(poke.name, JSON.stringify(poke.name))
                copyPokemon.childNodes[2].onclick = e => {
                    favorites.removeChild(copyPokemon)
                    localStorage.removeItem(poke.name)

                    favorite.style.backgroundColor = 'white'
                    click = true

                    if (!favorites.children.length) {
                        titleFavorite.style.display = 'none'
                    }
                }
            } else {
                click = true
                favorite.style.backgroundColor = 'white'
                favorites.removeChild(copyPokemon)
                localStorage.removeItem(poke.name)

                if (!favorites.children.length) {
                    titleFavorite.style.display = 'none'
                }
            }
        }
        if (localStorage.getItem(poke.name)) {
            favorite.click()
        }
    }

    function mountPokemonsCards(poke) {

        // Esta função irá montar os cards e o sistema de favoritar os cards dos pokemons.
        //pokemonDiv
        const pokemonDiv = document.createElement('div')
        pokemonDiv.className = `pokemonDiv poDiv${poke.id}`

        //imagem do pokemon
        const img = document.createElement('img')
        img.classList = 'sprite'
        img.src = poke.sprites.front_default

        // As infos
        const informations = document.createElement('div')
        informations.className = 'informations'

        //Link para a página do pokemon
        const link = document.createElement('a')
        link.href = `pokemon.html?name=${poke.name}`

        //Nome do pokemon
        const name = document.createElement('h1')
        name.className = 'name'
        name.innerHTML = poke.name


        // Favoritar
        const favorite = document.createElement('button')
        favorite.className = `favorite favo${poke.id}`

        // Aninhar os elementos

        pokemonDiv.appendChild(img)
        pokemonDiv.appendChild(informations)
        informations.appendChild(link)
        link.appendChild(name)
        pokemonDiv.appendChild(favorite)


        poke.types.forEach(type => {
            const typeDiv = document.createElement('div')
            typeDiv.className = `type ${type.type.name}`
            typeDiv.innerHTML = type.type.name
            informations.appendChild(typeDiv)
        })
        const copyPokemon = pokemonDiv.cloneNode(true)
        copyPokemon.className += ` copy${poke.id}`
        favoriteSystem(favorite, copyPokemon, poke)
        return pokemonDiv
    }

    function searchPokemon() {

        // Esta função é para o funcionamento da barra de pesquisa da página principal

        fetch(API + input.value.replace(/\s+/g, '').toLowerCase())

            .then(resp => resp.json())
            .then(json => {
                if (!input.value.replace(/\s+/g, '') == '') {
                    window.location.href = `pokemon.html?name=${input.value.replace(/\s+/g, '').toLowerCase()}`
                }
            })
            .catch(e => alert('Este pokemon não existe!'))
    }

    async function Pokemons() {

        // Esta função vai pegar todos o pokemons da API e passar na função de montar os cards dos pokemons

        const pokemonsAll = await fetch(API + `?offset=${currentOffset}&limit=21`)
        const json = await pokemonsAll.json()

        const promises = json.results.map(async (poke) => {
            const pokemonAttr = await fetch(API + poke.name)
            const pokemon = await pokemonAttr.json()
            return pokemon
        })

        const pokemons = await Promise.all(promises)
        pokemons.sort((a, b) => a.order - b.order)
        pokemons.forEach(poke => {
            pokemonsDiv.appendChild(mountPokemonsCards(poke))
        })
        currentOffset += 21
        localStorage.setItem('current', currentOffset)
    }
    buttonSearch.onclick = searchPokemon
    Pokemons()
    buttonMoreView.onclick = Pokemons

    click = true
    toggleMode.onclick = e => {
        if (click) {
            click = false
            return cleanMode()
        } else {
            click = true
            return darkMode()
        }
    }
    if (localStorage.getItem('white')) {
        click = false
        cleanMode()
    } else {
        click = true
        darkMode()
    }
})