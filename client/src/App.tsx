import React, { FC, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import LoginForm from './components/LoginForm';
import { Context } from './index';
import UserService from './services/UserService';
import { IUser } from './models/User';

const App: FC = () => {
  const { store } = useContext(Context);
  const [users, setUsers] = useState<IUser[]>([]);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      store.checkAuth();
    }
  }, []);

  async function getUsers() {
    try {
      const response = await UserService.fetchUsers();
      setUsers(response.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  if (store.isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!store.isAuth) {
    return (
      <>
        <LoginForm />
        <div>
          <button onClick={getUsers}>Get users</button>
        </div>
        {users.map((user) => (
          <div key={user.email}>{user.email}</div>
        ))}
      </>
    );
  }

  return (
    <div>
      <h1>
        {store.isAuth
          ? `User authorized ${store.user.email}`
          : 'Need authorize!'}
      </h1>
      <h1>
        {store.user.isActivated ? 'Account verified' : 'Account not verified'}
      </h1>
      <button onClick={() => store.logout()}>Logout</button>
      <div>
        <button onClick={getUsers}>Get users</button>
      </div>
      {users.map((user) => (
        <div key={user.email}>{user.email}</div>
      ))}
    </div>
  );
};

export default observer(App);
