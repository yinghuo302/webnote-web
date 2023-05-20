import { createSignal, JSXElement, Show, ValidComponent } from "solid-js"
import { Dynamic, Portal } from "solid-js/web"
import { bus } from "../utils"
export function Modal() {
	type ModalState = {
		component: ValidComponent,
		open: boolean
	}
	const [state, setState] = createSignal<ModalState>({ component: null, open: false })
	bus.on('Modal', (st: ModalState) => {
		setState(st)
	})
	return (
		<Show when={state().open}>
			<Portal mount={document.body}>
				<div class="relative z-20" aria-labelledby="modal-title" role="dialog" aria-modal="true" onclick={()=> setState({open:false,component:state().component})}>
					<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
					<div class="fixed inset-0 z-10 overflow-y-auto">
						<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
							<div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all">
								<div class="w-max h-max flex justify-center items-center" onclick={(e)=>e.stopPropagation()}>
									<Dynamic component={state().component}></Dynamic>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Portal>
		</Show>
	)
}
