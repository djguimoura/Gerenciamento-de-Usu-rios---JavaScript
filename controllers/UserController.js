class UserController {//tudo será chamado na class index.ks
    constructor(formId, tableId){
        this.formEl = document.getElementById(formId);
        this.tableEl = document.getElementById(tableId);
        this.btn = this.formEl.querySelector('[type=submit]');
        this.onSubmit();
    }

    onSubmit(){
        this.formEl.addEventListener('submit', event => {
            event.preventDefault();//cancela a ação do evento nativo do JS
            this.btn.disabled = true;
            
            let values = this.getValues();

            //Para tratar o envio da foto em caso do campo ficar vazio, caso seja vazio, retorna 'false' e para a execução
            if(!values) return false;

            this.getPhoto().then((content) => {
                values.photo = content;
                this.addLine(values);
                this.formEl.reset();
                this.btn.disabled = false;
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

    getValues(){
        let user = {};
        let isValid = true;
        //fields.forEach(function(field, index){
        //usando o recurso "spread" para forçar a function "forEach" entender que os elementos se tratam de um array, então encapsula dentro dos colchetes e utiliza-se o reticências
        [...this.formEl.elements].forEach((field, index) => { //arrow function
            if(['name','email','password'].indexOf(field.name) > -1 && !field.value){
                field.parentElement.classList.add('has-error');
                isValid = false;
                this.btn.disabled = false;
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
                <button type="button" class="btn btn-primary btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>
        </tr>
        `;
        this.tableEl.appendChild(tr);
        this.updateCount();
    }

    //Outras maneiras de formatar a data, e com a classe Utils.js trabalhando com o método criado "dateFormat" para formatar de acordo com a necessidade
    //<td>${Utils.dateFormat(dataUser.register)}</td>
    //<td>${new Date(dataUser.birth).toLocaleDateString('pt-BR')}</td>

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