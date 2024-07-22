class Utils {
    static dateFormat(date){
        //padStart() método js para formatar cadeia de caracteres, ex: se lenght do month > 1 adiciona o 0
        return `${date.getDate()}/${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
    }
}