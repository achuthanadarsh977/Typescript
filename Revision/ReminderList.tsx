import React from 'react'
import Remaindermodel from '../model/reminder';

interface RemainderListProps{
    items:Remaindermodel[]
    onRemoveReminder: (id:number) => void
}


const ReminderList:React.FC<RemainderListProps> = ({items,onRemoveReminder}) =>{

     return (
    <ul className="list-group">
      {items.map((item) => (
        <li key={item.id} className="list-group-item">
          {item.title}
          <button onClick = {() => onRemoveReminder(item.id)} className = "btn btn-danger mx-2 rounded-pill">Delete</button>
        </li>
      ))}
    </ul>
  );
}

export default ReminderList;