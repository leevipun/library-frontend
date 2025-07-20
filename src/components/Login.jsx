import { gql, useMutation } from "@apollo/client";

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

const ME = gql`
  query me {
    me {
      username
      favoriteGenre
      id
    }
  }
`;

export default function Login({ show, setShow, setUser }) {
    if (!show) return null;
    const [login] = useMutation(LOGIN);

    const handleLogin = async (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;

        try {
            const result = await login({
                variables: { username, password }
            });
            console.log("Login successful:", result);
            const token = result.data.login.value;
            localStorage.setItem('library-user-token', token);

            // Fetch user data after login
            const userResponse = await fetch('http://localhost:4000/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    query: `
                        query {
                            me {
                                username
                                favoriteGenre
                                id
                            }
                        }
                    `
                })
            });

            const userData = await userResponse.json();
            if (userData.data?.me) {
                setUser(userData.data.me);
            }

            setShow("authors"); // Redirect to authors page after login
        }
        catch (error) {
            console.error("Login failed:", error);
            // Handle login error (e.g., show a notification)
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    username
                    <input type="text" name="username" />
                </div>
                <div>
                    password
                    <input type="password" name="password" />
                </div>
                <button type="submit">login</button>
            </form>
        </div>
    );
}