import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/build-client";
import Header from "../components/header";

// This component will wrap all component pages.
const AppComponent =  ({ Component, pageProps, currentUser }) => {
  return <div>
    <Header currentUser = { currentUser } />
    <div className="container">
      <Component currentUser = { currentUser } { ...pageProps }/>
    </div>
  </div>
};


// getInitialProps this function will be called both side: client and server:
// 1. getInitialProps executed on the client When:
// - Navigating from one page to another while in the app
// 2. getInitialProps executed on the server when:
// - Hard refresh of page
// - Clicking link from different domain
// - Typing URL into address bar

AppComponent.getInitialProps = async appContext => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get("/api/users/currentuser");

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }

  return {
    pageProps,
    ...data
  };
}

export default AppComponent;
