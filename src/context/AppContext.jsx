import {useReducer, createContext, useContext, useCallback} from "react"
import getData from "../api"
import useLocalStorage from "../hooks/useLocalStorage"

const AppStateContext = createContext()
const AppDispatchContext = createContext()

const initialState = {
  activeList: [],
  employeesList: [],
  loading: true,
  error: false,
}

function reducer(state, action) {
  switch (action.type) {
    case "showEmployees":
      return {
        ...state,
        employeesList: action.data,
        loading: false,
      }
    case "getDataFromCache":
      return {
        ...state,
        activeList: action.cachedData,
      }
    case "catchError":
      return {
        ...state,
        loading: false,
        error: true,
      }

    case "toggleActive":
      return {
        ...state,
        activeList: state.activeList.includes(action.value)
          ? [...state.activeList]
          : [action.value, ...state.activeList],
      }

    case "toggleNotActive":
      return {
        ...state,
        activeList: state.activeList.filter(el => el.id !== action.value.id),
      }

    default:
      throw Error("something went wrong")
  }
}

export const AppStateProvider = ({children}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppStateContext)
  if (!context) {
    throw Error("useAppContext must be called within AppContext")
  }
  return context
}

export const useDispatchContext = () => {
  const context = useContext(AppDispatchContext)
  if (!context) {
    throw Error("useDispatchContext must be called within AppContext")
  }
  return context
}

export const useLoadEmployees = () => {
  const dispatch = useDispatchContext()
  const storageData = useLocalStorage("CACHED_DATA")
  const [cachedData] = storageData

  const loadEmployees = useCallback(() => {
    return getData().then(data => {
      if (Array.isArray(data)) {
        dispatch({type: "showEmployees", data})
        if (cachedData) {
          dispatch({type: "getDataFromCache", cachedData})
        }
      } else {
        dispatch({type: "catchError"})
      }
    })
  }, [cachedData, dispatch])
  return loadEmployees
}

export const useToggleActive = () => {
  const dispatch = useDispatchContext()

  function toggleActive(value) {
    dispatch({type: "toggleActive", value})
  }
  return toggleActive
}

export const useToggleNotActive = () => {
  const dispatch = useDispatchContext()

  function toggleNotActive(value) {
    dispatch({type: "toggleNotActive", value})
  }
  return toggleNotActive
}
