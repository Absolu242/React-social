import React, {useState, useReducer, useEffect, Suspense} from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter, Switch, Route} from 'react-router-dom'
import Axios from 'axios'
import {useImmerReducer} from 'use-immer'
import {CSSTransition} from 'react-transition-group'
import StateContext from './StateContext'
import DispatchContext from './DispatchContext'

Axios.defaults.baseURL = 'http://localhost:8080'
//Components

import Header from './components/Header'
import HomeGuest from './components/HomeGuest'
import Home from './components/Home'
import About from './components/About'
import Terms from './components/Terms'
import Footer from './components/Footer'
const CreatePost = React.lazy(() => import('./components/CreatePost'))
const ViewSinglePost = React.lazy(() => import('./components/ViewSinglePost'))
const Search = React.lazy(() => import('./components/Search'))
const Chat = React.lazy(() => import('./components/Chat'))

import EditPost from './components/EditPost'
import FlashMessages from './components/FlashMessages'
import Profile from './components/Profile'
import NotFound from './components/NotFound'
import LoadingDotsIcon from './components/LoadingDotsIcon'

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem('complexappToken')),
    flashMessages: [],
    user: {
      token: localStorage.getItem('complexappToken'),
      username: localStorage.getItem('complexappUsername'),
      avatar: localStorage.getItem('complexappAvatar'),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0,
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'login':
        draft.loggedIn = true
        draft.user = action.data
        break
      case 'logout':
        draft.loggedIn = false
        break
      case 'flashMessage':
        draft.flashMessages.push(action.value)
        break
      case 'openSearch':
        draft.isSearchOpen = true
        break
      case 'closeSearch':
        draft.isSearchOpen = false
        break
      case 'toggleChat':
        draft.isChatOpen = !draft.isChatOpen
        break
      case 'closeChat':
        draft.isChatOpen = false
        break
      case 'incrementUnreadChatCount':
        draft.unreadChatCount++
        return
      case 'clearUnreadChatCount':
        draft.unreadChatCount = 0
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)
  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem('complexappToken', state.user.token)
      localStorage.setItem('complexappUsername', state.user.username)
      localStorage.setItem('complexappAvatar', state.user.avatar)
    } else {
      localStorage.removeItem('complexappToken')
      localStorage.removeItem('complexappUsername')
      localStorage.removeItem('complexappAvatar')
    }
  }, [state.loggedIn])

  // check if token has expired or not on first render

  useEffect(() => {
    if (state.loggedIn) {
      //Send axios request here
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post(
            '/checkToken',
            {token: state.user.token},
            {cancelToken: ourRequest.token}
          )
          if (!response.data) {
            dispatch({type: 'logout'})
            dispatch({
              type: 'flashMessage',
              value: 'Your Session has expired. Please log in again',
            })
          }
        } catch (e) {
          console.log('There was a problem or the request was canceled')
        }
      }
      fetchResults()
      return () => ourRequest.cancel
    }
  }, [state.loggedIn])
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <Header />
          <FlashMessages messages={state.flashMessages} />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Switch>
              <Route path="/profile/:username">
                <Profile />
              </Route>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/create-post">
                <CreatePost />
              </Route>
              <Route path="/post/:id" exact>
                <ViewSinglePost />
              </Route>
              <Route path="/post/:id/edit" exact>
                <EditPost />
              </Route>
              <Route path="/about-us" exact>
                {' '}
                <About />
              </Route>
              <Route path="/terms" exact>
                {' '}
                <Terms />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition
            timeout={330}
            in={state.isSearchOpen}
            classNames="search-overlay"
            unmountOnExit
          >
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

ReactDOM.render(<Main />, document.querySelector('#app'))

if (module.hot) {
  module.hot.accept()
}
