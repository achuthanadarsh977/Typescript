import axios from 'axios';
import Remaindermodel from '../model/reminder';

class RemainderService{

    http = axios.create({
        baseURL:'https://jsonplaceholder.typicode.com/'
    });

    async getReminders(){
        const response = await this.http.get<Remaindermodel[]>('/todos')
        return response.data
    }

    async addReminder(title:string){
        const response = await this.http.post<Remaindermodel>('/todos',{title})
        return response.data
    }

    async removeReminder(id:number){
        const response = await this.http.delete('/todos/'+id)
        return response.data
    }
}

export default new RemainderService();