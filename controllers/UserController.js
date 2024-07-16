//tudo será chamado na class index.ks
class UserController {
    //"constructor" com a estrutura do formulário
    constructor(formIdCreate, formIdUpdate, tableId){
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);
        this.btnSubmit = this.formEl.querySelector('[type=submit]');
        this.btnUpdate = this.formUpdateEl.querySelector('[type=submit]');
        this.onSubmit();
        this.onEdit();
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

            //console.log(values);

            tr.dataset.user = JSON.stringify(values);
            tr.innerHTML = `
            <tr>
                <td><img src="${values.photo}" alt="User Image" class="img-circle img-sm"></td>
                <td>${values.name}</td>
                <td>${values.email}</td>
                <td>${(values.admin) ? 'Sim' : 'Não'}</td>
                <td>${values.register}</td>
                <td>
                    <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                    <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
                </td>
            </tr>
            `;

            this.btnUpdate.disabled = false;
            this.addEventsTr(tr);
            this.updateCount();
            this.showPanelCreate();
        });
    }

    onSubmit(){
        this.formEl.addEventListener('submit', event => {
            //cancela a ação do evento nativo do JS
            event.preventDefault();
            this.btnSubmit.disabled = true;
            
            let values = this.getValues(this.formEl);

            //Para tratar o envio da foto em caso do campo ficar vazio, caso seja vazio, retorna 'false' e para a execução
            if(!values) return false;

            this.getPhoto().then((content) => {
                values.photo = content;
                this.addLine(values);
                this.formEl.reset();
                this.btnSubmit.disabled = false;
            }, (e) =>{
                    console.error(e);
                }
            );
        });
    }

    getPhoto(){
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            let elements = [...this.formEl.elements].filter(item=>{//verificando se o elemento é o input de arquivo
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

    getValues(formEl){
        let user = {};
        let isValid = true;
        //fields.forEach(function(field, index){
        //usando o recurso "spread" para forçar a function "forEach" entender que os elementos se tratam de um array, então encapsula dentro dos colchetes e utiliza-se o reticências
        [...formEl.elements].forEach((field, index) => { //arrow function
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

    addLine(dataUser){ 
        let tr = document.createElement('tr');
        //converte o objeto que retorna como string para formato JSON (serialzação)
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
                <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>
        </tr>
        `;

        this.addEventsTr(tr);
        this.tableEl.appendChild(tr);
        this.updateCount();
    }

    //Outras maneiras de formatar a data, e com a classe Utils.js trabalhando com o método criado "dateFormat" para formatar de acordo com a necessidade
    //<td>${Utils.dateFormat(dataUser.register)}</td>
    //<td>${new Date(dataUser.birth).toLocaleDateString('pt-BR')}</td>

    addEventsTr(tr){
        tr.querySelector(".btn-edit").addEventListener("click", e=> {
            let json = JSON.parse(tr.dataset.user);
            let form = document.querySelector("#form-user-update");

            //capturando os index do grid
            form.dataset.trIndex = tr.sectionRowIndex;
            
            //laço para percorrer objetos do grid para serem enviados ao form de 'update'
            for (let name in json){
                //replace para trocar o _ do nome do objeto
                let field = form.querySelector(`[name="${name.replace("_","")}"]`);

                //se campo for diferente de vazio entra no bloco
                if (field){
                    //'switch' para verificar os types dos fields
                    switch (field.type){
                        case "file":
                        continue;

                        case "radio":
                            //validando o type checked (M ou F) do gender
                            field = form.querySelector(`[name="${name.replace("_","")}"][value="${json[name]}"]`);
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