import {
    attachListener,
    detachListener
} from '../core/render/dom'
import { SwiperInstance } from '../core/index'
import { Options } from '../core/options'

export type SwiperPluginMousewheelOptions = Options & {
    mousewheel: {
        invert: false
        sensitivity: 1
        interval: 400
    }
}

export type SwiperPluginMousewheelInstance = {
    $el: HTMLElement
}

export default function SwiperPluginMousewheel (
    instance: SwiperInstance & {
        mousewheel: SwiperPluginMousewheelInstance
    },
    options: SwiperPluginMousewheelOptions
) {
    const mousewheel = {
        $el: null
    } as unknown as SwiperPluginMousewheelInstance
    const wheelStatus = {
        wheeling: false,
        wheelDelta: 0,
        wheelingTimer: 0
    }
    const handler = (e: WheelEvent) => {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY)
            ? e.deltaX
            : e.deltaY
        const {
            index
        } = instance.state

        if ((Math.abs(delta) - Math.abs(wheelStatus.wheelDelta) > 0)
            && !wheelStatus.wheeling
            && Math.abs(delta) >= options.mousewheel.sensitivity
        ) {
            const step = options.mousewheel.invert ? -1 : 1

            instance.slideTo(delta > 0
                ? index - step
                : index + step
            )
            wheelStatus.wheeling = true
            wheelStatus.wheelingTimer = setTimeout(() => {
                wheelStatus.wheeling = false
            }, options.mousewheel.interval) as unknown as number
        }
        wheelStatus.wheelDelta = delta
        e.preventDefault()
        e.stopPropagation()
    }

    instance.on('before-init', () => {
        if (options.mousewheel) {
            options.mousewheel = Object.assign({
                invert: false,
                sensitivity: 1,
                interval: 400
            }, options.mousewheel)
        }
    })

    instance.on('after-init', () => {
        if (!options.mousewheel) return

        const {
            element
        } = instance.env
        const {
            $el
        } = element

        mousewheel.$el = $el

        attachListener($el, 'wheel', <EventListener>handler)
    })

    instance.on('after-destroy', () => {
        if (!options.mousewheel) return

        detachListener(mousewheel.$el, 'wheel', <EventListener>handler)
        delete mousewheel.$el
    })
}
