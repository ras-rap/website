import { IconTrash } from '@tabler/icons-react'

export function RecycleWindow({
  items,
  onEmpty,
}: {
  items: string[]
  onEmpty: () => void
}) {
  return (
    <div className="recycle-window">
      <p className="recycle-window__label">deleted_ideas/</p>
      <div className="recycle-window__items">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item} className="recycle-window__item">
              <IconTrash size={16} stroke={1.8} />
              <span>{item}</span>
            </div>
          ))
        ) : (
          <p>No deleted files. The regrets have been temporarily archived.</p>
        )}
      </div>
      <button type="button" className="recycle-window__button" onClick={onEmpty}>
        Empty Recycle Bin
      </button>
      <div className="recycle-window__status">{items.length} items (mostly regrets)</div>
    </div>
  )
}
