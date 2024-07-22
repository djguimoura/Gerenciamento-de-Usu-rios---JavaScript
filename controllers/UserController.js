//tudo será chamado na class index.ks
class UserController {
    //"constructor" com a estrutura do formulário
    constructor(formIdCreate, formIdUpdate, tableId){
        this.formCreateEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);
        this.btnSubmit = this.formCreateEl.querySelector('[type=submit]');
        this.btnUpdate = this.formUpdateEl.querySelector('[type=submit]');
        this.onSubmit();
        this.onEdit();
        //chamando o método para carregar no sessionStorage caso contenha dados armazenados na sessão
        this.selectAll();
    }

    onEdit(){
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{
            this.showPanelCreate();
        });

        this.formUpdateEl.addEventListener("submit", e =>{
            e.preventDefault();
            this.btnUpdate.disabled = true;

            //capturando os dados preenchidos no form de update para atulizar no grid            
            let values = this.getValues(this.formUpdateEl);

            //identificando o index do objeto/linha do grid que está sendo trabalhado
            //"dataset" é utilizado para armazenar dados diretamente nos elementos HTML e manipulá-los em js
            let index = this.formUpdateEl.dataset.trIndex;
            let tr = this.tableEl.rows[index];

            //capturando value antigo do objeto user
            let userOld = JSON.parse(tr.dataset.user);
            
            //utilizando o Object.assign() para copiar o valor de atributos do objeto, criando um obj destino e retornando este objeto
            //os objetos que estão à direita no parâmetro substitui os objetos da esqueda
            let result = Object.assign({}, userOld, values);

            //console.log(values);

            this.getPhoto(this.formUpdateEl).then((content) => {
                //se não houver alteração na foto, mantém a foto existente
                if(!values.photo){
                    result._photo = userOld._photo;
                } else {
                    //caputurando o novo value/content da photo a ser atualizada
                    result._photo = content;
                }

                //instanciando novo user
                let user = new User();
                //para carregar os dados do objeto em 'user' através do parâmetro 'result'
                user.loadFromJSON(result);

                //salvando os novos dados via localStorage mapeado pelo método 'save()'
                user.save();               
            
                //chamando o método 'getTr()' com segundo parâmetro devido a tr já existir e ele precisar ser informda
                this.getTr(user, tr);    
                this.updateCount();
                this.btnUpdate.disabled = false;
                this.formUpdateEl.reset();
                this.showPanelCreate();
            }, (e) =>{
                    console.error(e);
                }
            );
        });
    }

    onSubmit(){
        this.formCreateEl.addEventListener('submit', event => {
            //cancela a ação do evento nativo do JS
            event.preventDefault();
            this.btnSubmit.disabled = true;
            
            let values = this.getValues(this.formCreateEl);

            //Para tratar o envio da foto em caso do campo ficar vazio, caso seja vazio, retorna 'false' e para a execução
            if(!values) return false;

            this.getPhoto(this.formCreateEl).then((content) => {
                values.photo = content;
                //salvando os dados via localStorage mapeado pelo método 'save()'
                values.save();
                this.addLine(values);
                this.formCreateEl.reset();
                this.btnSubmit.disabled = false;
            }, (e) =>{
                    console.error(e);
                }
            );
        });
    }

    getPhoto(formCreateEl){
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            let elements = [...formCreateEl.elements].filter(item=>{//verificando se o elemento é o input de arquivo
                if(item.name === 'photo'){
                    return item;
                }
            });
            
            let file = elements[0].files[0];//pegando somente o primeiro item de arquivo
    
            fileReader.onload = ()=>{
                resolve(fileReader.result);
            };
            fileReader.onerror = () => {
                reject(e);
            };
            if(file)
                fileReader.readAsDataURL(file);
            else
                resolve('dist/img/boxed-bg.jpg');
        });
    }

    getValues(formCreateEl){
        let user = {};
        let isValid = true;
        //fields.forEach(function(field, index){
        //usando o recurso "spread" para forçar a function "forEach" entender que os elementos se tratam de um array, então encapsula dentro dos colchetes e utiliza-se o reticências
        [...formCreateEl.elements].forEach((field, index) => { //arrow function
            //validando campos obrigatórios/required
            if(['name','email','password'].indexOf(field.name) > -1 && !field.value){
                field.parentElement.classList.add('has-error');
                isValid = false;
                this.btnSubmit.disabled = false;
            }
            
            if(field.name === "gender"){
                field.checked ? user[field.name] = field.value: false;
            } else if(field.name == "admin"){
                user[field.name] = field.checked;
            } else {
                user[field.name] = field.value;
            }
        });

        if(!isValid){
            return false;
        }

        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin,
            user.register
        );
    }

    selectAll(){
        //método 'getUserStorage()' sendo carregado da classe 'User.js' (método estático)
        let users = User.getUserStorage();

        users.forEach(dataUser =>{
            //instanciando um novo user para funcionar dentro do método 'addLine()'
            let user = new User();

            //carregando o objeto user a partir de um JSON
            user.loadFromJSON(dataUser);
            this.addLine(user);
        });
    }

    addLine(dataUser){ 
        //não utilizando o segundo parâmetro pois será uma tr nova (null)
        //var para guardar (getTr) a linha da tr do user
        let tr = this.getTr(dataUser);   
        this.tableEl.appendChild(tr);
        this.updateCount();
    }

    //método para selecionar a tr que será gerada e segundo parâmetro é opcional, se não for passado, será null
    getTr(dataUser, tr = null){
        //se tr === null cria um novo elemento/linha
        if(tr === null) tr = document.createElement('tr');

        //stringify converte um object json em string
        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `
        <tr>
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
            <td>${dataUser.register}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        </tr>
        `;

        this.addEventsTr(tr);
        return tr;
    }

    //Outras maneiras de formatar a data, e com a classe Utils.js trabalhando com o método criado "dateFormat" para formatar de acordo com a necessidade
    //<td>${Utils.dateFormat(dataUser.register)}</td>
    //<td>${new Date(dataUser.birth).toLocaleDateString('pt-BR')}</td>

    //método para manipular eventos da linha(tr)
    addEventsTr(tr){
        tr.querySelector(".btn-delete").addEventListener("click", e=> {
            //event 'confirm' abre um alert de confirmação com ok e cancelar
            if (confirm("Deseja realmente excluir esse registro?")){
                //removendo a linha (tr)
                tr.remove();

                //instanciando o user para manipular a exclusão do dado
                let user = new User();
                user.loadFromJSON(JSON.parse(tr.dataset.user));
                user.delete();

                this.updateCount();
            }
        });

        tr.querySelector(".btn-edit").addEventListener("click", e=> {
            let json = JSON.parse(tr.dataset.user);

            //capturando os index do grid
            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;
            
            //laço para percorrer objetos do grid para serem enviados ao form de 'update'
            for (let name in json){
                //replace para trocar o _ do nome do objeto
                let field = this.formUpdateEl.querySelector(`[name="${name.replace("_","")}"]`);

                //se campo for diferente de vazio entra no bloco
                if (field){
                    //'switch' para verificar os types dos fields
                    switch (field.type){
                        case "file":
                        continue;

                        case "radio":
                            //validando o type checked (M ou F) do gender
                            field = this.formUpdateEl.querySelector(`[name="${name.replace("_","")}"][value="${json[name]}"]`);
                            field.checked = true;
                        break;

                        case "checkbox":
                            field.checked = json[name];
                        break;

                        default:
                            //preenchendo cada valor de objeto que foi recuperado no for 
                            field.value = json[name];
                    }
                }
            }

            //através da captura do elemento da tag img, inputa o value da nova foto (pagando do objeto/json)
            this.formUpdateEl.querySelector(".photo").src = json._photo;
            this.showPanelUpdate();
        });
    }

    showPanelCreate(){
        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";
    }

    showPanelUpdate(){
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";
    }

    updateCount(){
        let numberUsers = 0;
        let numberAdmin = 0;

        //... se chama spread para distribuir corretamente o array e os elementos em suas posições
        [...this.tableEl.children].forEach(tr => {
            numberUsers++;
            //JSON.parse para converer o retorno novamente em objeto
            let user = JSON.parse(tr.dataset.user);
            //valida se o objeto é um admin e adiciona o count
            if(user._admin) numberAdmin++;
        });

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;
    }
}