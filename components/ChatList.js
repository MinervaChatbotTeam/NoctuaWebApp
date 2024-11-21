import apiClient from '@/ApiClient';
import styles from '../styles/Home.module.css';

export default function ChatList({ chats, setActiveChat, addNewChat, getChats }) {
  return (
    <div className={styles.chatList}>
      <button className={styles.newChat} onClick={addNewChat}>
        + New Chat
      </button>
      <ul className={styles.chatListContainer}>
        {chats.map((chat) => (
          <li 
            key={chat.id} 
            className={styles.chatListItem} 
            onClick={() => setActiveChat(chat.id)}
          >
            {chat.title}
            <button className='bg-red-500' onClick={async()=>{(await apiClient.deleteChat(chat.id));getChats(); setActiveChat(null)}}>  X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
