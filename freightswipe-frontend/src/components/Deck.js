import React, { useState } from 'react'
import { useSprings, animated, to as interpolate } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { Link } from 'react-router-dom'
import { formatRoute, formatEndpoints, formatWeight, formatMoney } from './Record'

// Resting position for card i. The offset is capped so a 17-card deck does not
// stack 68px up the page, and there is no `delay` -- delaying the initial set is
// what left the deck blank on first paint.
const to = (i) => ({
  x: 0,
  y: Math.min(i, 3) * 4,
  scale: 1,
  rot: 0,
})
const trans = (r, s) =>
  `perspective(1500px) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

/** One label-over-figure row in the card's hairline-separated fact list. */
const Fact = ({ label, value }) =>
  value === undefined || value === null || value === '' ? null : (
    <div className="swipe-card__fact">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )

function Deck({ data, onSwipe }) {
  const [gone] = useState(() => new Set())
  // No entrance animation: springs created with a far-off `from` were not settling,
  // which left every card parked ~1000px above the viewport and the deck invisible.
  const [props, api] = useSprings(data.length, i => ({ ...to(i) }))

  const triggerSwipe = (dir, index) => {
    gone.add(index);
    const item = data[index];
    onSwipe(dir === 1 ? 'right' : 'left', item.id);
    api.start(i => {
      if (index !== i) return;
      const x = (200 + window.innerWidth) * dir;
      const rot = dir * 10 * 1; // Simulate a swipe rotation
      return { x, rot, config: { friction: 50, tension: 200 } };
    });
    if (gone.size === data.length) {
      setTimeout(() => {
        gone.clear();
        api.start(i => to(i));
      }, 600);
    }
  };

  const bind = useDrag(({ args: [index], down, movement: [mx], direction: [xDir], velocity: [vx] }) => {
    const trigger = vx > 0.2
    const dir = xDir < 0 ? -1 : 1
    if (!down && trigger) {
      triggerSwipe(dir, index);
    }

    api.start(i => {
      if (index !== i) return
      const isGone = gone.has(index)
      const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0
      const rot = mx / 100 + (isGone ? dir * 10 * vx : 0)
      const scale = down ? 1.1 : 1
      return {
        x,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
      }
    })
  })

  return (
    <div className='cardContainer'>
        {props.map(({ x, y, rot, scale }, i) => {
          const item = data[i];
          // A trucker swiping loads gets the load itself; a shipper swiping
          // pending matches gets a match wrapping the load.
          const isLoad = !item.trucker;
          const load = isLoad ? item : item.load;

          return (
            <animated.div className="deck" key={i} style={{ x, y }}>
              <animated.div
                {...bind(i)}
                style={{
                  transform: interpolate([rot, scale], trans),
                }} >
                <div className='swipe-card'>
                  <span className="swipe-card__eyebrow">
                    {isLoad ? 'Available load' : 'Interested trucker'}
                  </span>

                  <h3>{formatRoute(load.origin, load.destination)}</h3>
                  <p className="swipe-card__endpoints">
                    {formatEndpoints(load.origin, load.destination)}
                  </p>

                  <dl className="swipe-card__facts">
                    {!isLoad && <Fact label="Trucker" value={item.trucker.name} />}
                    <Fact label="Weight" value={formatWeight(load.weight)} />
                    <Fact label="Budget" value={formatMoney(load.budget)} />
                    {isLoad && (
                      <Fact
                        label="Deadline"
                        value={new Date(load.deadline).toLocaleDateString()}
                      />
                    )}
                    {!isLoad && <Fact label="Status" value={String(item.status).replace(/_/g, ' ')} />}
                  </dl>

                  {isLoad && item.description && (
                    <p className="swipe-card__note">{item.description}</p>
                  )}

                  {!isLoad && (
                    <Link
                      to={`/reviews/${item.trucker.id}`}
                      className="au-btn au-btn--secondary au-btn--sm"
                    >
                      View reviews
                    </Link>
                  )}

                  <div className="swipe-card__spacer" />

                  <div className="buttons">
                    <button
                      type="button"
                      className="swipe-decline"
                      onClick={() => triggerSwipe(-1, i)}
                    >
                      Pass
                    </button>
                    <button
                      type="button"
                      className="swipe-accept"
                      onClick={() => triggerSwipe(1, i)}
                    >
                      Accept <span aria-hidden="true">&rarr;</span>
                    </button>
                  </div>
                </div>
              </animated.div>
            </animated.div>
          )
        })}
    </div>
  )
}

export default Deck;
