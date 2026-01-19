import { useEffect } from 'react'
import { CURRENT_VERSION } from '../../shared/changelog'
import { MODAL_ID } from '../sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '../signals'
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '../utilities'

const useShowChangelog = () => {
  useEffect(() => {
    const lastSeenVersion = getFromLocalStorage<string | null>(LOCAL_STORAGE_KEYS.CHANGELOG_LAST_SEEN_VERSION, null)

    if (lastSeenVersion !== CURRENT_VERSION) {
      activeModalSignal.value = {
        id: MODAL_ID.CHANGELOG_MODAL,
        showLatestOnly: true,
      }
      setToLocalStorage(LOCAL_STORAGE_KEYS.CHANGELOG_LAST_SEEN_VERSION, CURRENT_VERSION)
    }
  }, [])
}

export default useShowChangelog
