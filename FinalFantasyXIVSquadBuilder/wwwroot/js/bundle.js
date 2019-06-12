
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(component, store, callback) {
        const unsub = store.subscribe(callback);
        component.$$.on_destroy.push(unsub.unsubscribe
            ? () => unsub.unsubscribe()
            : unsub);
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function on_outro(callback) {
        outros.callbacks.push(callback);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                $$.fragment.l(children(options.target));
            }
            else {
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                }
            };
        }
        return { set, update, subscribe };
    }

    const appSquadStore = writable([]);

    const squad = {
        subscribe: appSquadStore.subscribe,
        set: appSquadStore.set,
        init: () => {
            var members = JSON.parse(localStorage.getItem("members"));
    		if(members === null || members === ""){
    			fetch('https://localhost:44365/api/Squad/Roster')
    			.then(rlt => {
    				if(!rlt.ok){
    					throw new Error("Failed!");
    				}
    				return rlt.json();
    			})
    			.then(data => {
    				appSquadStore.set(data);
    			})
    			.catch(err => {
    				console.log(err);
    			});
    		} else {
    			appSquadStore.set(members);
    		}
        },
        updateSquadron: (id, memberData) => {
            appSquadStore.update(members => {
                const idx = members.findIndex(m => m.id === id);
                const member = members[idx];
                const updatedMembers = [...members];
                updatedMembers[idx] = {
                    id: member.id,
                    name: memberData.name,
                    physical: memberData.physical,
                    mental: memberData.mental,
                    tactical: memberData.tactical,
                    selected: false,
                    active: false
                };

                if (typeof(Storage) !== "undefined" && updatedMembers.length > 0) {
                    localStorage.setItem("members", JSON.stringify(updatedMembers));
                }

                return updatedMembers;
            });
        }
    };

    /* src\Components\SquadItem.svelte generated by Svelte v3.4.4 */

    const file = "src\\Components\\SquadItem.svelte";

    function create_fragment(ctx) {
    	var li, b, t0_value = ctx.member.name, t0, br, t1, t2_value = ctx.member.physical, t2, t3, t4_value = ctx.member.mental, t4, t5, t6_value = ctx.member.tactical, t6, dispose;

    	return {
    		c: function create() {
    			li = element("li");
    			b = element("b");
    			t0 = text(t0_value);
    			br = element("br");
    			t1 = text("\r\n    P: ");
    			t2 = text(t2_value);
    			t3 = text(" / M: ");
    			t4 = text(t4_value);
    			t5 = text(" / T: ");
    			t6 = text(t6_value);
    			add_location(b, file, 30, 4, 659);
    			add_location(br, file, 30, 24, 679);
    			li.className = "list-group-item squadmember svelte-zpuv74";
    			toggle_class(li, "selectedmember", ctx.selected);
    			toggle_class(li, "activemember", ctx.active);
    			add_location(li, file, 29, 0, 540);
    			dispose = listen(li, "click", ctx.click_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, b);
    			append(b, t0);
    			append(li, br);
    			append(li, t1);
    			append(li, t2);
    			append(li, t3);
    			append(li, t4);
    			append(li, t5);
    			append(li, t6);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.member) && t0_value !== (t0_value = ctx.member.name)) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.member) && t2_value !== (t2_value = ctx.member.physical)) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.member) && t4_value !== (t4_value = ctx.member.mental)) {
    				set_data(t4, t4_value);
    			}

    			if ((changed.member) && t6_value !== (t6_value = ctx.member.tactical)) {
    				set_data(t6, t6_value);
    			}

    			if (changed.selected) {
    				toggle_class(li, "selectedmember", ctx.selected);
    			}

    			if (changed.active) {
    				toggle_class(li, "activemember", ctx.active);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}

    			dispose();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $squad;

    	validate_store(squad, 'squad');
    	subscribe($$self, squad, $$value => { $squad = $$value; $$invalidate('$squad', $squad); });

    	let { memberId = 0, selected = false, active = false } = $$props;

    	const writable_props = ['memberId', 'selected', 'active'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SquadItem> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ('memberId' in $$props) $$invalidate('memberId', memberId = $$props.memberId);
    		if ('selected' in $$props) $$invalidate('selected', selected = $$props.selected);
    		if ('active' in $$props) $$invalidate('active', active = $$props.active);
    	};

    	let member;

    	$$self.$$.update = ($$dirty = { $squad: 1, memberId: 1 }) => {
    		if ($$dirty.$squad || $$dirty.memberId) { $$invalidate('member', member = $squad.find(s => s.id === memberId)); }
    	};

    	return {
    		memberId,
    		selected,
    		active,
    		member,
    		click_handler
    	};
    }

    class SquadItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["memberId", "selected", "active"]);
    	}

    	get memberId() {
    		throw new Error("<SquadItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set memberId(value) {
    		throw new Error("<SquadItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<SquadItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<SquadItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<SquadItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<SquadItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Squadlist.svelte generated by Svelte v3.4.4 */

    const file$1 = "src\\Components\\Squadlist.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.member = list[i];
    	return child_ctx;
    }

    // (28:2) {#each $squad as member}
    function create_each_block(ctx) {
    	var current;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	var squaditem = new SquadItem({
    		props: {
    		memberId: ctx.member.id,
    		selected: ctx.member.id === ctx.selectedID,
    		active: ctx.activeMembers.includes(ctx.member.id)
    	},
    		$$inline: true
    	});
    	squaditem.$on("click", click_handler);

    	return {
    		c: function create() {
    			squaditem.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(squaditem, target, anchor);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			var squaditem_changes = {};
    			if (changed.$squad) squaditem_changes.memberId = ctx.member.id;
    			if (changed.$squad || changed.selectedID) squaditem_changes.selected = ctx.member.id === ctx.selectedID;
    			if (changed.activeMembers || changed.$squad) squaditem_changes.active = ctx.activeMembers.includes(ctx.member.id);
    			squaditem.$set(squaditem_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			squaditem.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			squaditem.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			squaditem.$destroy(detaching);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var div2, div0, t0, t1, t2, t3, div1, ul, current;

    	var each_value = ctx.$squad;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function outro_block(i, detaching, local) {
    		if (each_blocks[i]) {
    			if (detaching) {
    				on_outro(() => {
    					each_blocks[i].d(detaching);
    					each_blocks[i] = null;
    				});
    			}

    			each_blocks[i].o(local);
    		}
    	}

    	return {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text("Squad Members (");
    			t1 = text(ctx.squadCount);
    			t2 = text(" of 8)");
    			t3 = space();
    			div1 = element("div");
    			ul = element("ul");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			div0.className = "card-header svelte-x60vz9";
    			add_location(div0, file$1, 24, 4, 472);
    			ul.className = "list-group";
    			add_location(ul, file$1, 26, 2, 569);
    			div1.className = "card-body svelte-x60vz9";
    			add_location(div1, file$1, 25, 4, 542);
    			div2.className = "card svelte-x60vz9";
    			add_location(div2, file$1, 23, 0, 448);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, t0);
    			append(div0, t1);
    			append(div0, t2);
    			append(div2, t3);
    			append(div2, div1);
    			append(div1, ul);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.squadCount) {
    				set_data(t1, ctx.squadCount);
    			}

    			if (changed.$squad || changed.selectedID || changed.activeMembers) {
    				each_value = ctx.$squad;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						each_blocks[i].i(1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].i(1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) outro_block(i, 1, 1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) each_blocks[i].i();

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) outro_block(i, 0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $squad;

    	validate_store(squad, 'squad');
    	subscribe($$self, squad, $$value => { $squad = $$value; $$invalidate('$squad', $squad); });

    	

    	let { selectedID = -1, activeMembers = [] } = $$props;

    	const dispatch = createEventDispatcher();

    	const writable_props = ['selectedID', 'activeMembers'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Squadlist> was created with unknown prop '${key}'`);
    	});

    	function click_handler({ member }) {
    						dispatch("item-selected", member.id);
    					}

    	$$self.$set = $$props => {
    		if ('selectedID' in $$props) $$invalidate('selectedID', selectedID = $$props.selectedID);
    		if ('activeMembers' in $$props) $$invalidate('activeMembers', activeMembers = $$props.activeMembers);
    	};

    	let squadCount;

    	$$self.$$.update = ($$dirty = { $squad: 1 }) => {
    		if ($$dirty.$squad) { $$invalidate('squadCount', squadCount = $squad.length); }
    	};

    	return {
    		selectedID,
    		activeMembers,
    		dispatch,
    		squadCount,
    		$squad,
    		click_handler
    	};
    }

    class Squadlist extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["selectedID", "activeMembers"]);
    	}

    	get selectedID() {
    		throw new Error("<Squadlist>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedID(value) {
    		throw new Error("<Squadlist>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeMembers() {
    		throw new Error("<Squadlist>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeMembers(value) {
    		throw new Error("<Squadlist>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\SquadEditor.svelte generated by Svelte v3.4.4 */

    const file$2 = "src\\Components\\SquadEditor.svelte";

    function create_fragment$2(ctx) {
    	var div10, div9, div0, a, t1, div8, div7, form, div1, label0, t3, input0, t4, div6, div2, label1, t6, input1, t7, div3, label2, t9, input2, t10, div4, label3, t12, input3, t13, div5, button0, t15, button1, dispose;

    	return {
    		c: function create() {
    			div10 = element("div");
    			div9 = element("div");
    			div0 = element("div");
    			a = element("a");
    			a.textContent = "Add / Edit Squad Member";
    			t1 = space();
    			div8 = element("div");
    			div7 = element("div");
    			form = element("form");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name:";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div6 = element("div");
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Physical:";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div3 = element("div");
    			label2 = element("label");
    			label2.textContent = "Mental:";
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			div4 = element("div");
    			label3 = element("label");
    			label3.textContent = "Tactical:";
    			t12 = space();
    			input3 = element("input");
    			t13 = space();
    			div5 = element("div");
    			button0 = element("button");
    			button0.textContent = "Cancel";
    			t15 = space();
    			button1 = element("button");
    			button1.textContent = "Save";
    			a.className = "btn btn-link";
    			a.dataset.toggle = "collapse";
    			a.href = "#collapseEdit";
    			attr(a, "role", "button");
    			attr(a, "aria-expanded", "true");
    			attr(a, "aria-controls", "collapseEdit");
    			add_location(a, file$2, 70, 12, 1664);
    			div0.className = "card-header svelte-ww1y1e";
    			div0.id = "headingEdit";
    			add_location(div0, file$2, 69, 8, 1608);
    			label0.htmlFor = "memberName";
    			add_location(label0, file$2, 76, 24, 2082);
    			attr(input0, "type", "text");
    			input0.className = "form-control";
    			input0.id = "memberName";
    			input0.placeholder = "Squad Member Name";
    			add_location(input0, file$2, 77, 24, 2145);
    			div1.className = "form-group";
    			add_location(div1, file$2, 75, 20, 2032);
    			label1.htmlFor = "physicalScore";
    			add_location(label1, file$2, 81, 28, 2412);
    			attr(input1, "type", "number");
    			input1.className = "form-control";
    			input1.id = "physicalScore";
    			input1.placeholder = "0";
    			add_location(input1, file$2, 82, 28, 2486);
    			div2.className = "form-group col-md-4";
    			add_location(div2, file$2, 80, 24, 2349);
    			label2.htmlFor = "mentalScore";
    			add_location(label2, file$2, 85, 28, 2706);
    			attr(input2, "type", "number");
    			input2.className = "form-control";
    			input2.id = "mentalScore";
    			input2.placeholder = "0";
    			add_location(input2, file$2, 86, 28, 2776);
    			div3.className = "form-group col-md-4";
    			add_location(div3, file$2, 84, 24, 2643);
    			label3.htmlFor = "tacticalScore";
    			add_location(label3, file$2, 89, 28, 2992);
    			attr(input3, "type", "number");
    			input3.className = "form-control";
    			input3.id = "tacticalScore";
    			input3.placeholder = "0";
    			add_location(input3, file$2, 90, 28, 3066);
    			div4.className = "form-group col-md-4";
    			add_location(div4, file$2, 88, 24, 2929);
    			button0.className = "btn btn-secondary float-right svelte-ww1y1e";
    			add_location(button0, file$2, 93, 28, 3283);
    			button1.className = "btn btn-primary float-right svelte-ww1y1e";
    			add_location(button1, file$2, 94, 28, 3410);
    			div5.className = "col-md-12";
    			add_location(div5, file$2, 92, 24, 3223);
    			div6.className = "form-row";
    			add_location(div6, file$2, 79, 20, 2301);
    			add_location(form, file$2, 74, 16, 2004);
    			div7.className = "card-body svelte-ww1y1e";
    			add_location(div7, file$2, 73, 12, 1963);
    			div8.id = "collapseEdit";
    			div8.className = "collapse show";
    			attr(div8, "aria-labelledby", "headingEdit");
    			div8.dataset.parent = "#accordion";
    			add_location(div8, file$2, 72, 8, 1849);
    			div9.className = "card svelte-ww1y1e";
    			add_location(div9, file$2, 68, 4, 1580);
    			div10.id = "accordion";
    			add_location(div10, file$2, 67, 0, 1554);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(input2, "input", ctx.input2_input_handler),
    				listen(input3, "input", ctx.input3_input_handler),
    				listen(button0, "click", prevent_default(ctx.clearForm)),
    				listen(button1, "click", prevent_default(ctx.saveMember))
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div10, anchor);
    			append(div10, div9);
    			append(div9, div0);
    			append(div0, a);
    			append(div9, t1);
    			append(div9, div8);
    			append(div8, div7);
    			append(div7, form);
    			append(form, div1);
    			append(div1, label0);
    			append(div1, t3);
    			append(div1, input0);

    			input0.value = ctx.name;

    			append(form, t4);
    			append(form, div6);
    			append(div6, div2);
    			append(div2, label1);
    			append(div2, t6);
    			append(div2, input1);

    			input1.value = ctx.physical;

    			append(div6, t7);
    			append(div6, div3);
    			append(div3, label2);
    			append(div3, t9);
    			append(div3, input2);

    			input2.value = ctx.mental;

    			append(div6, t10);
    			append(div6, div4);
    			append(div4, label3);
    			append(div4, t12);
    			append(div4, input3);

    			input3.value = ctx.tactical;

    			append(div6, t13);
    			append(div6, div5);
    			append(div5, button0);
    			append(div5, t15);
    			append(div5, button1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.name && (input0.value !== ctx.name)) input0.value = ctx.name;
    			if (changed.physical) input1.value = ctx.physical;
    			if (changed.mental) input2.value = ctx.mental;
    			if (changed.tactical) input3.value = ctx.tactical;
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div10);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $squad;

    	validate_store(squad, 'squad');
    	subscribe($$self, squad, $$value => { $squad = $$value; $$invalidate('$squad', $squad); });

    	
        
        let { selectedID = -1 } = $$props;
        let currentMember = null;
        
        let currentId = 0;
        let name = "";
        let physical = 0;
        let mental = 0;
        let tactical = 0;

    	const dispatch = createEventDispatcher();

        function saveMember(){
            squad.updateSquadron(
                selectedID, 
                {
                    id: 0,
                    name: name,
                    physical: physical,
                    mental: mental,
                    tactical: tactical
                });
            clearForm();
        }

        function clearForm(){
            $$invalidate('currentId', currentId = 0);
            dispatch("editor-complete");
        }

    	const writable_props = ['selectedID'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SquadEditor> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate('name', name), $$invalidate('selectedID', selectedID), $$invalidate('currentId', currentId), $$invalidate('$squad', $squad), $$invalidate('currentMember', currentMember);
    	}

    	function input1_input_handler() {
    		physical = to_number(this.value);
    		$$invalidate('physical', physical), $$invalidate('selectedID', selectedID), $$invalidate('currentId', currentId), $$invalidate('$squad', $squad), $$invalidate('currentMember', currentMember);
    	}

    	function input2_input_handler() {
    		mental = to_number(this.value);
    		$$invalidate('mental', mental), $$invalidate('selectedID', selectedID), $$invalidate('currentId', currentId), $$invalidate('$squad', $squad), $$invalidate('currentMember', currentMember);
    	}

    	function input3_input_handler() {
    		tactical = to_number(this.value);
    		$$invalidate('tactical', tactical), $$invalidate('selectedID', selectedID), $$invalidate('currentId', currentId), $$invalidate('$squad', $squad), $$invalidate('currentMember', currentMember);
    	}

    	$$self.$set = $$props => {
    		if ('selectedID' in $$props) $$invalidate('selectedID', selectedID = $$props.selectedID);
    	};

    	$$self.$$.update = ($$dirty = { selectedID: 1, currentId: 1, $squad: 1, currentMember: 1 }) => {
    		if ($$dirty.selectedID || $$dirty.currentId || $$dirty.$squad || $$dirty.currentMember) { if(selectedID !== currentId){
                if(selectedID > -1){
                    const unsubscribe = squad.subscribe(data => {
                        $$invalidate('currentMember', currentMember = $squad.find(s => s.id === selectedID) || {id: 0, name: "", physical: 0, mental: 0, tactical: 0});
                        $$invalidate('name', name = currentMember.name);
                        $$invalidate('physical', physical = currentMember.physical);
                        $$invalidate('mental', mental = currentMember.mental);
                        $$invalidate('tactical', tactical = currentMember.tactical);
                    });
                    unsubscribe();
                    $$invalidate('currentId', currentId = selectedID);
                } else {
                    $$invalidate('name', name = "");
                    $$invalidate('physical', physical = 0);
                    $$invalidate('mental', mental = 0);
                    $$invalidate('tactical', tactical = 0);
                }	
            } }
    	};

    	return {
    		selectedID,
    		name,
    		physical,
    		mental,
    		tactical,
    		saveMember,
    		clearForm,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler
    	};
    }

    class SquadEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["selectedID"]);
    	}

    	get selectedID() {
    		throw new Error("<SquadEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedID(value) {
    		throw new Error("<SquadEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const squadConfiguration = writable([]);

    const squadConfig = {
        subscribe: squadConfiguration.subscribe,
        set: squadConfiguration.set,
        init: () => {
    		var configs = JSON.parse(localStorage.getItem("configs"));
    		if(configs === null || configs === "") {
    			fetch('https://localhost:44365/api/Squad/Attributes')
    			.then(rlt => {
    				if(!rlt.ok){
    					throw new Error("Failed!");
    				}
    				return rlt.json();
    			})
    			.then(data => {
    				squadConfig.set(data);
    			})
    			.catch(err => {
    				console.log(err);
    			});
    		}
    		else {
    			squadConfig.set(configs);
    		}
    	},
    	updateConfiguration: (squadatt,configatt) => {
    		squadConfiguration.update(configs => {
    			var data = [squadatt,configatt];
    			if (typeof(Storage) !== "undefined") {
                    localStorage.setItem("configs", JSON.stringify(data));
                }
    			return data;
    		});
    	}
    };

    /* src\Components\SquadCalculator.svelte generated by Svelte v3.4.4 */

    const file$3 = "src\\Components\\SquadCalculator.svelte";

    function create_fragment$3(ctx) {
    	var div15, div0, t1, div14, b0, t3, div4, div1, label0, t5, input0, t6, div2, label1, t8, input1, t9, div3, label2, t11, input2, t12, b1, t14, div9, div5, label3, t16, input3, t17, div6, label4, t19, input4, t20, div7, label5, t22, input5, t23, div8, button, t25, b2, t27, div13, div10, label6, t29, input6, t30, div11, label7, t32, input7, t33, div12, label8, t35, input8, t36, b3, dispose;

    	return {
    		c: function create() {
    			div15 = element("div");
    			div0 = element("div");
    			div0.textContent = "Calculate Squad Configuration";
    			t1 = space();
    			div14 = element("div");
    			b0 = element("b");
    			b0.textContent = "Squadron Attributes";
    			t3 = space();
    			div4 = element("div");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Physical:";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Mental:";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			div3 = element("div");
    			label2 = element("label");
    			label2.textContent = "Tactical:";
    			t11 = space();
    			input2 = element("input");
    			t12 = space();
    			b1 = element("b");
    			b1.textContent = "Required Attributes";
    			t14 = space();
    			div9 = element("div");
    			div5 = element("div");
    			label3 = element("label");
    			label3.textContent = "Physical:";
    			t16 = space();
    			input3 = element("input");
    			t17 = space();
    			div6 = element("div");
    			label4 = element("label");
    			label4.textContent = "Mental:";
    			t19 = space();
    			input4 = element("input");
    			t20 = space();
    			div7 = element("div");
    			label5 = element("label");
    			label5.textContent = "Tactical:";
    			t22 = space();
    			input5 = element("input");
    			t23 = space();
    			div8 = element("div");
    			button = element("button");
    			button.textContent = "Calculate";
    			t25 = space();
    			b2 = element("b");
    			b2.textContent = "Current Attributes";
    			t27 = space();
    			div13 = element("div");
    			div10 = element("div");
    			label6 = element("label");
    			label6.textContent = "Physical:";
    			t29 = space();
    			input6 = element("input");
    			t30 = space();
    			div11 = element("div");
    			label7 = element("label");
    			label7.textContent = "Mental:";
    			t32 = space();
    			input7 = element("input");
    			t33 = space();
    			div12 = element("div");
    			label8 = element("label");
    			label8.textContent = "Tactical:";
    			t35 = space();
    			input8 = element("input");
    			t36 = space();
    			b3 = element("b");
    			b3.textContent = "Recommended Training:";
    			div0.className = "card-header svelte-ww1y1e";
    			add_location(div0, file$3, 32, 4, 749);
    			add_location(b0, file$3, 34, 4, 844);
    			label0.htmlFor = "physicalScore";
    			add_location(label0, file$3, 37, 16, 967);
    			attr(input0, "type", "number");
    			input0.className = "form-control";
    			input0.id = "physicalScore";
    			input0.placeholder = "0";
    			add_location(input0, file$3, 38, 16, 1029);
    			div1.className = "form-group col-md-4";
    			add_location(div1, file$3, 36, 12, 916);
    			label1.htmlFor = "mentalScore";
    			add_location(label1, file$3, 41, 16, 1222);
    			attr(input1, "type", "number");
    			input1.className = "form-control";
    			input1.id = "mentalScore";
    			input1.placeholder = "0";
    			add_location(input1, file$3, 42, 16, 1280);
    			div2.className = "form-group col-md-4";
    			add_location(div2, file$3, 40, 12, 1171);
    			label2.htmlFor = "tacticalScore";
    			add_location(label2, file$3, 45, 16, 1469);
    			attr(input2, "type", "number");
    			input2.className = "form-control";
    			input2.id = "tacticalScore";
    			input2.placeholder = "0";
    			add_location(input2, file$3, 46, 16, 1531);
    			div3.className = "form-group col-md-4";
    			add_location(div3, file$3, 44, 12, 1418);
    			div4.className = "form-row";
    			add_location(div4, file$3, 35, 8, 880);
    			add_location(b1, file$3, 49, 8, 1685);
    			label3.htmlFor = "physicalScore";
    			add_location(label3, file$3, 52, 16, 1808);
    			attr(input3, "type", "number");
    			input3.className = "form-control";
    			input3.id = "physicalScore";
    			input3.placeholder = "0";
    			add_location(input3, file$3, 53, 16, 1870);
    			div5.className = "form-group col-md-4";
    			add_location(div5, file$3, 51, 12, 1757);
    			label4.htmlFor = "mentalScore";
    			add_location(label4, file$3, 56, 16, 2065);
    			attr(input4, "type", "number");
    			input4.className = "form-control";
    			input4.id = "mentalScore";
    			input4.placeholder = "0";
    			add_location(input4, file$3, 57, 16, 2123);
    			div6.className = "form-group col-md-4";
    			add_location(div6, file$3, 55, 12, 2014);
    			label5.htmlFor = "tacticalScore";
    			add_location(label5, file$3, 60, 16, 2314);
    			attr(input5, "type", "number");
    			input5.className = "form-control";
    			input5.id = "tacticalScore";
    			input5.placeholder = "0";
    			add_location(input5, file$3, 61, 16, 2376);
    			div7.className = "form-group col-md-4";
    			add_location(div7, file$3, 59, 12, 2263);
    			button.className = "btn btn-primary float-right svelte-ww1y1e";
    			add_location(button, file$3, 64, 16, 2568);
    			div8.className = "col-md-12";
    			add_location(div8, file$3, 63, 12, 2520);
    			div9.className = "form-row";
    			add_location(div9, file$3, 50, 8, 1721);
    			add_location(b2, file$3, 67, 8, 2699);
    			label6.htmlFor = "physicalScore";
    			add_location(label6, file$3, 70, 16, 2821);
    			attr(input6, "type", "text");
    			input6.className = "form-control";
    			input6.id = "physicalScore";
    			input6.placeholder = "0";
    			input6.readOnly = true;
    			add_location(input6, file$3, 71, 16, 2883);
    			div10.className = "form-group col-md-4";
    			add_location(div10, file$3, 69, 12, 2770);
    			label7.htmlFor = "mentalScore";
    			add_location(label7, file$3, 74, 16, 3052);
    			attr(input7, "type", "text");
    			input7.className = "form-control";
    			input7.id = "mentalScore";
    			input7.placeholder = "0";
    			input7.readOnly = true;
    			add_location(input7, file$3, 75, 16, 3110);
    			div11.className = "form-group col-md-4";
    			add_location(div11, file$3, 73, 12, 3001);
    			label8.htmlFor = "tacticalScore";
    			add_location(label8, file$3, 78, 16, 3277);
    			attr(input8, "type", "text");
    			input8.className = "form-control";
    			input8.id = "tacticalScore";
    			input8.placeholder = "0";
    			input8.readOnly = true;
    			add_location(input8, file$3, 79, 16, 3339);
    			div12.className = "form-group col-md-4";
    			add_location(div12, file$3, 77, 12, 3226);
    			div13.className = "form-row";
    			add_location(div13, file$3, 68, 8, 2734);
    			add_location(b3, file$3, 82, 8, 3469);
    			div14.className = "card-body svelte-ww1y1e";
    			add_location(div14, file$3, 33, 4, 815);
    			div15.className = "card svelte-ww1y1e";
    			add_location(div15, file$3, 31, 0, 725);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(input2, "input", ctx.input2_input_handler),
    				listen(input3, "input", ctx.input3_input_handler),
    				listen(input4, "input", ctx.input4_input_handler),
    				listen(input5, "input", ctx.input5_input_handler),
    				listen(button, "click", ctx.OnCalculate)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div15, anchor);
    			append(div15, div0);
    			append(div15, t1);
    			append(div15, div14);
    			append(div14, b0);
    			append(div14, t3);
    			append(div14, div4);
    			append(div4, div1);
    			append(div1, label0);
    			append(div1, t5);
    			append(div1, input0);

    			input0.value = ctx.squadatt.physical;

    			append(div4, t6);
    			append(div4, div2);
    			append(div2, label1);
    			append(div2, t8);
    			append(div2, input1);

    			input1.value = ctx.squadatt.mental;

    			append(div4, t9);
    			append(div4, div3);
    			append(div3, label2);
    			append(div3, t11);
    			append(div3, input2);

    			input2.value = ctx.squadatt.tactical;

    			append(div14, t12);
    			append(div14, b1);
    			append(div14, t14);
    			append(div14, div9);
    			append(div9, div5);
    			append(div5, label3);
    			append(div5, t16);
    			append(div5, input3);

    			input3.value = ctx.missionatt.physical;

    			append(div9, t17);
    			append(div9, div6);
    			append(div6, label4);
    			append(div6, t19);
    			append(div6, input4);

    			input4.value = ctx.missionatt.mental;

    			append(div9, t20);
    			append(div9, div7);
    			append(div7, label5);
    			append(div7, t22);
    			append(div7, input5);

    			input5.value = ctx.missionatt.tactical;

    			append(div9, t23);
    			append(div9, div8);
    			append(div8, button);
    			append(div14, t25);
    			append(div14, b2);
    			append(div14, t27);
    			append(div14, div13);
    			append(div13, div10);
    			append(div10, label6);
    			append(div10, t29);
    			append(div10, input6);
    			append(div13, t30);
    			append(div13, div11);
    			append(div11, label7);
    			append(div11, t32);
    			append(div11, input7);
    			append(div13, t33);
    			append(div13, div12);
    			append(div12, label8);
    			append(div12, t35);
    			append(div12, input8);
    			append(div14, t36);
    			append(div14, b3);
    		},

    		p: function update(changed, ctx) {
    			if (changed.squadatt) input0.value = ctx.squadatt.physical;
    			if (changed.squadatt) input1.value = ctx.squadatt.mental;
    			if (changed.squadatt) input2.value = ctx.squadatt.tactical;
    			if (changed.missionatt) input3.value = ctx.missionatt.physical;
    			if (changed.missionatt) input4.value = ctx.missionatt.mental;
    			if (changed.missionatt) input5.value = ctx.missionatt.tactical;
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div15);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $squadConfig;

    	validate_store(squadConfig, 'squadConfig');
    	subscribe($$self, squadConfig, $$value => { $squadConfig = $$value; $$invalidate('$squadConfig', $squadConfig); });

    	

        const dispatch = createEventDispatcher();

        function OnCalculate(){
            squadConfig.updateConfiguration(squadatt,missionatt);
            dispatch("calculate");
        }

    	function input0_input_handler() {
    		squadatt.physical = to_number(this.value);
    		$$invalidate('squadatt', squadatt), $$invalidate('$squadConfig', $squadConfig);
    	}

    	function input1_input_handler() {
    		squadatt.mental = to_number(this.value);
    		$$invalidate('squadatt', squadatt), $$invalidate('$squadConfig', $squadConfig);
    	}

    	function input2_input_handler() {
    		squadatt.tactical = to_number(this.value);
    		$$invalidate('squadatt', squadatt), $$invalidate('$squadConfig', $squadConfig);
    	}

    	function input3_input_handler() {
    		missionatt.physical = to_number(this.value);
    		$$invalidate('missionatt', missionatt), $$invalidate('$squadConfig', $squadConfig);
    	}

    	function input4_input_handler() {
    		missionatt.mental = to_number(this.value);
    		$$invalidate('missionatt', missionatt), $$invalidate('$squadConfig', $squadConfig);
    	}

    	function input5_input_handler() {
    		missionatt.tactical = to_number(this.value);
    		$$invalidate('missionatt', missionatt), $$invalidate('$squadConfig', $squadConfig);
    	}

    	let squadatt, missionatt;

    	$$self.$$.update = ($$dirty = { $squadConfig: 1 }) => {
    		if ($$dirty.$squadConfig) { $$invalidate('squadatt', squadatt = $squadConfig.find(s => s.name === "Squadron") || {physical: 0, mental: 0, tactical: 0}); }
    		if ($$dirty.$squadConfig) { $$invalidate('missionatt', missionatt = $squadConfig.find(s => s.name === "Mission") || {physical: 0, mental: 0, tactical: 0}); }
    	};

    	return {
    		OnCalculate,
    		squadatt,
    		missionatt,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler
    	};
    }

    class SquadCalculator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, []);
    	}
    }

    /* src\App.svelte generated by Svelte v3.4.4 */

    const file$4 = "src\\App.svelte";

    function create_fragment$4(ctx) {
    	var div2, div0, t0, div1, t1, current;

    	var squadlist = new Squadlist({
    		props: {
    		selectedID: ctx.selectedID,
    		activeMembers: ctx.activeMembers
    	},
    		$$inline: true
    	});
    	squadlist.$on("item-selected", ctx.itemSelected);

    	var squadeditor = new SquadEditor({
    		props: { selectedID: ctx.selectedID },
    		$$inline: true
    	});
    	squadeditor.$on("editor-complete", ctx.clearSelectedItem);

    	var squadcalculator = new SquadCalculator({ $$inline: true });

    	return {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			squadlist.$$.fragment.c();
    			t0 = space();
    			div1 = element("div");
    			squadeditor.$$.fragment.c();
    			t1 = space();
    			squadcalculator.$$.fragment.c();
    			div0.className = "col-4";
    			add_location(div0, file$4, 34, 1, 784);
    			div1.className = "col-8";
    			add_location(div1, file$4, 37, 1, 916);
    			div2.className = "row";
    			add_location(div2, file$4, 33, 0, 765);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			mount_component(squadlist, div0, null);
    			append(div2, t0);
    			append(div2, div1);
    			mount_component(squadeditor, div1, null);
    			append(div1, t1);
    			mount_component(squadcalculator, div1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var squadlist_changes = {};
    			if (changed.selectedID) squadlist_changes.selectedID = ctx.selectedID;
    			if (changed.activeMembers) squadlist_changes.activeMembers = ctx.activeMembers;
    			squadlist.$set(squadlist_changes);

    			var squadeditor_changes = {};
    			if (changed.selectedID) squadeditor_changes.selectedID = ctx.selectedID;
    			squadeditor.$set(squadeditor_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			squadlist.$$.fragment.i(local);

    			squadeditor.$$.fragment.i(local);

    			squadcalculator.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			squadlist.$$.fragment.o(local);
    			squadeditor.$$.fragment.o(local);
    			squadcalculator.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			squadlist.$destroy();

    			squadeditor.$destroy();

    			squadcalculator.$destroy();
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $squad;

    	validate_store(squad, 'squad');
    	subscribe($$self, squad, $$value => { $squad = $$value; $$invalidate('$squad', $squad); });

    	

    	let selectedID = -1;
    	let activeMembers = [];

    	function itemSelected(event){		
    		$$invalidate('selectedID', selectedID = event.detail);
    		let member = $squad.find(s => s.id === selectedID);
    		member.selected = true;
    	}

    	function clearSelectedItem(){
    		$$invalidate('selectedID', selectedID = -1);
    		let member = $squad.find(s => s.selected === true);
    		if(member){ member.selected = false; }
    	}

    onMount(() => {
    	squad.init();
    	squadConfig.init();
    });

    	return {
    		selectedID,
    		activeMembers,
    		itemSelected,
    		clearSelectedItem
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.getElementById('app'),
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
