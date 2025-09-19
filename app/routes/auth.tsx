import { usePuterStore } from "lib/puter"
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export const meta = () => ([
    { title: 'Resumind | Auth' },
    { name: 'descreption', content: 'Lon onto yout account' }
])
const Auth = () => {
    const { isLoading, auth } = usePuterStore();
    const location = useLocation()
    const next = location.search.split('next=')[1];
    const navigate = useNavigate();

    useEffect(
        () => {
            if (auth.isAuthenticated) navigate(next)
        },
        [auth.isAuthenticated, next]
    )
    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover flex items-center justify-center">
            <div className="graidirnt-border shadow-lg">
                <section className="flex flex-col gap-8 bg-white rounded-2xl p-10"></section>
                <div className="flex flex-col gap-8 bg-white rounded-2xl p-10 center">
                    <h1>welcom</h1>
                    <h2>Log In to continue your job journey</h2>
                </div>
                <div>
                    {isLoading ? (<button className="auth-button abimate-pules">
                        <p>
                            Singing you in...
                        </p>
                    </button>
                    ) : <>
                        {auth.isAuthenticated ? (
                            <button className="auth-button" onClick={auth.signOut}>Sign Out</button>

                        ) : (
                            <button className="auth-button" onClick={auth.signIn}>
                                Log In
                            </button>

                        )



                        }

                    </>}
                </div>
            </div>
        </main>
    )
}

export default Auth