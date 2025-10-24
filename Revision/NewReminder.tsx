
import React, { useState } from "react";

interface NewReminderProps {
  onAddReminder: (title: string) => void;
}

const NewReminder: React.FC<NewReminderProps> = ({ onAddReminder }) => {
  const [title, setTitle] = useState<string>("");

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddReminder(title);   // send data to parent
    setTitle("");           // clear input
  };

  return (
    <form onSubmit={submitHandler} className="mb-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="form-control mb-2"
        placeholder="Enter reminder..."
      />
      <button className="btn btn-primary">Add Reminder</button>
    </form>
  );
};

export default NewReminder;
