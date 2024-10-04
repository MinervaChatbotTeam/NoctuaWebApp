import styles from '../styles/Home.module.css';

export default function ChatList({ chats, setActiveChat, addNewChat }) {
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
          </li>
        ))}
      </ul>
    </div>
  );
}
