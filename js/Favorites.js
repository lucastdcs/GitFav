import { GitHubUsers } from "./GitHubUsers.js"
export class FavoritesData {
    constructor(root) {
        this.root = document.querySelector(root)
        this.loadUsers()
    }
    loadUsers() {
        this.userEntries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }
    saveUsers() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.userEntries))
        this.clearInput()
        document.location.reload(true);


    }
    async getUser(username) {
        try {

            const userExists = this.userEntries.find(entry => entry.login === username)
            if (userExists) {
                throw new Error('Usuário já cadastrado')
            }
            const user = await GitHubUsers.search(username)

            if (user.login === undefined) {
                throw new Error('Usuário não encontrado')
            }
            this.userEntries = [user, ...this.userEntries]
            this.update()
            this.saveUsers()
            this.forEmptyTbody()


        } catch (e) {
            alert(e.message)
        }
    }

    deleteUser(user) {
        const filteredEntries = this.userEntries
            .filter(entry => entry.login != user.login)
        this.userEntries = filteredEntries
        this.update()
        this.saveUsers()
    }
}

export class FavoritesView extends FavoritesData {
    constructor(root) {
        super(root)
        this.tbody = this.root.querySelector('table tbody')
        this.update()
        this.getValue()
        this.forEmptyTbody()
    }
    update() {
        this.removeAllRows()

        this.userEntries.forEach(user => {
            const row = this.createRow();
            row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
            row.querySelector('.user a').href = `https://github.com/${user.login}`;
            row.querySelector('.user a p').textContent = user.name;
            row.querySelector('.user a span').textContent = `/${user.login}`;
            row.querySelector('.repositories').textContent = user.public_repos;
            row.querySelector('.followers').textContent = user.followers;
            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza que deseja remover o usuário?')
                if (isOk) {
                    this.deleteUser(user)
                    this.forEmptyTbody()
                }
            }
        })
    }
    getValue() {
        const button = this.root.querySelector('.search button')
        button.onclick = () => {
            const { value } = this.root.querySelector('.search input')
            this.getUser(value)
        }


    }
    createRow() {
        const tr = document.createElement('tr')
        const content = `
        <td class="user">
                        <img src="https://github.com/lucastdcs.png" alt="Imagem de perfil">
                        <a href="https://github.com/lucastdcs" target="_blank">
                            <p>Lucas Teixeira</p>
                            <span>lucastdcs</span>
                        </a>
                    </td>
                    <td class="repositories">
                        2
                    </td>
                    <td class="followers">
                        1
                    </td>
                    <td>
                        <button class="remove">
                            Remover
                        </button>
        </td>
        `
        tr.innerHTML = content
        this.tbody.append(tr)

        return tr
    }
    removeAllRows() {
        this.tbody.querySelectorAll('tr').forEach((tr) => tr.remove());

    }
    clearInput() {
        this.root.querySelector('.search input').value = ''
    }

    forEmptyTbody() {
        console.log('rodei')
        console.log(this.userEntries)
        const empty = this.userEntries.length < 1;

        const table = this.root.querySelector('table')
        if (empty) {

            table.innerHTML = `
        <td class="empty-table" colspan="4">
                        <img src="assets/svgs/Estrela.svg" alt="Estrela">
                        <h1>Nenhum favorito ainda!</h1>
        </td>
        `
        }


    }
}