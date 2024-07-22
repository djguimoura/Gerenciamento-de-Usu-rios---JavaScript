class User {
    constructor(name, gender, birth, country, email, password, photo, admin){
       //o underline antes da variável as torna privadas para manipulação e posteriormente vc definir se irão ou não serem acessadas pelas outras classes
        this._id;
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date();
    }

    get id(){
        return this._id;
    }

    get name(){
        return this._name;
    }

    get gender(){
        return this._gender;
    }

    get birth(){
        return this._birth;
    }

    get country(){
        return this._country;
    }

    get email(){
        return this._email;
    }

    get password(){
        return this._password;
    }

    get photo(){
        return this._photo;
    }

    get admin(){
        return this._admin;
    }

    get register(){
        return this._register.toLocaleString('pt-BR');//toLocaleString();
    }

    set photo(value){
        this._photo = value;
    }

    //recebendo os dados no parâmetro 'json'
    loadFromJSON(json){
        //percorrendo objetos e os carregando para utilização no método 'selectAll()' do UserController
        for(let name in json){
            //'switch' para verificação se for o campo '_register' transforma em data para o carregamento
            switch(name){
                case '_register':
                    this[name] = new Date(json[name]);
                break;
                default:
                    this[name] = json[name]
            }
        }
    }

    //modificador 'static' utilizado pois o método será único da classe User.js e não será instanciado por outras classses
    static getUserStorage(){
        let users = []

        //verifcação se existe dado dentro do sessionStorage/localStorage
        if(localStorage.getItem("users")){
            //sobreescrevendo com 'JSON.parse' com o conteúdo da string armazenada no sessionStorage
            //com o JSON.parse será retornado o array de users
            users = JSON.parse(localStorage.getItem("users"));
        }
        return users;
    }

    getNewID(){

        //verificando se o id já existe no localStorage, 'parseInt()' para converter em number pois o localStorage guarda como 'string'
        let usersID = parseInt(localStorage.getItem("usersID"));

        //gerando ID para quando não existir
        //guardando na aplicação, neste caso na 'window'
        //gera um id com base na próxima sequencia do último id existente (id++)
        //o notEqual (!userID) igual à: se não for maior que 0 irá guardar 0
        if(!usersID > 0) usersID = 0;
        usersID++;

        //guardando o último id gerado, dessa forma o incremetal de novos ids será sempre a partir do último gerado (independente se ele for deletado ou não)
        localStorage.setItem("usersID", usersID);
        return usersID;
    }

    save(){
        //utilizando o objeto User diretamente (pois o mesmo pertence a classe atual e não precisa ser instanciado)
        //será retornado todos os users que estão aramazenados no localStorage4
        let users = User.getUserStorage();

        //se o id/user existir, o mesmo será utilizado no save
        if (this.id > 0){
            //dentro do array de users será filtrado o id quando for igual ao id da prop (this._id)
            //'filter' é utilizado para localizar um item dentro do array mas neste caso o método 'map' é mais viável
            users.map(u=>{
                //se o retorno/item for igual ao id (storage com o dado atual) e substitui pelo novo
                if(u._id == this.id){
                    //utilizando o 'Object.assign' para mesclar os novos dados com os já existente, no caso 'u' que possuia os dados anteriores com o 'this' que se trata do novo dado
                    Object.assign(u, this);
                }
                return u;
            });
        } else {
            //id criado com o método 'getNewID()'
            this._id = this.getNewID();

            //parâmetro 'this' sendo utilizado devido estar na mesma classe (está referenciando o mesmo objeto)
            users.push(this);
        }

        //utilizando para localStorage, onde os dados só serão perdidos caso o usuário limpe o cache do browser, localStorage funciona para browsers distintos
        localStorage.setItem("users", JSON.stringify(users));
    }

    delete(){
        //será retornado todos os users que estão aramazenados no localStorage4
        let users = User.getUserStorage();

        users.forEach((userData, index) => {
            //se o objeto dentro do loop é o obj instanciado para realizar a exclusão
            //valida se o id a ser excluído é o mesmo do localStorage
            if(this._id == userData._id){
                //método 'splice()' para remover o item do array 'users' e o segundo paramêtro informando a quantidade de itens a ser excluído
                //para remoção de todos os itens do localStorage, o método 'removeItem()' remove uma chave do localStorage (todos os itens armazenados)
                users.splice(index, 1);
            }
        });
        //atualizando o localStorage com os itens atuais (pós remoção)
        localStorage.setItem("users", JSON.stringify(users));
    }
}