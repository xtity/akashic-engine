namespace g {
	/**
	 * イベントの種別。
	 */
	export enum EventType {
		/**
		 * 不明なイベント。
		 * ゲーム開発者はこの値を利用してはならない。
		 */
		Unknown,
		/**
		 * プレイヤーの参加を表すイベント。
		 */
		Join,
		/**
		 * プレイヤーの離脱を表すイベント。
		 */
		Leave,
		/**
		 * タイムスタンプを表すイベント。
		 */
		Timestamp,
		/**
		 * 乱数生成器の生成を表すイベント。
		 * この値は利用されていない。
		 */
		Seed,
		/**
		 * ポイントダウンイベント。
		 */
		PointDown,
		/**
		 * ポイントムーブイベント。
		 */
		PointMove,
		/**
		 * ポイントアップイベント。
		 */
		PointUp,
		/**
		 * 汎用的なメッセージを表すイベント。
		 */
		Message,
		/**
		 * 操作プラグインが通知する操作を表すイベント。
		 */
		Operation
	}

	/**
	 * イベントを表すインターフェース。
	 */
	export interface Event {
		/**
		 * イベントの種別。
		 */
		type: EventType;
		/**
		 * イベントの優先度。
		 * 非常に多くのイベントが発生した場合、この値の低いイベントは、高いイベントよりも優先的に破棄・遅延される。
		 *
		 * ゲーム開発者がイベントを生成する場合、この値に 0 以上 2 以下の整数を指定することができる。
		 * ただしその値は単に参考値としてのみ利用される。
		 * エンジンはイベントの生成した主体などに応じて、この値を任意に変更する可能性がある。
		 */
		priority: number;
		/**
		 * このイベントがローカルであるか否か。
		 */
		local?: boolean;
	}

	/**
	 * ポインティングソースによって対象となるエンティティを表すインターフェース。
	 * エンティティとエンティティから見た相対座標によって構成される。
	 */
	export interface PointSource {
		target: E;
		point: CommonOffset;
		local?: boolean;
	}

	/**
	 * ポインティング操作を表すイベント。
	 * PointEvent#targetでそのポインティング操作の対象となったエンティティが、
	 * PointEvent#pointでそのエンティティから見ての相対座標が取得できる。
	 *
	 * 本イベントはマルチタッチに対応しており、PointEvent#pointerIdを参照することで識別することが出来る。
	 *
	 * abstract
	 */
	export class PointEvent implements Event {
		/**
		 * 本クラスはどのtypeにも属さない。
		 */
		type: EventType;
		priority: number;
		local: boolean;
		player: Player;
		pointerId: number;
		point: CommonOffset;
		target: E;

		constructor(pointerId: number, target: E, point: CommonOffset, player?: Player, local?: boolean, priority?: number) {
			this.priority = priority;
			this.local = local;
			this.player = player;
			this.pointerId = pointerId;
			this.target = target;
			this.point = point;
		}
	}

	/**
	 * ポインティング操作の開始を表すイベント。
	 */
	export class PointDownEvent extends PointEvent {
		type: EventType = EventType.PointDown;

		constructor(pointerId: number, target: E, point: CommonOffset, player?: Player, local?: boolean, priority?: number) {
			super(pointerId, target, point, player, local, priority);
		}
	}

	/**
	 * ポインティング操作の終了を表すイベント。
	 * PointDownEvent後にのみ発生する。
	 *
	 * PointUpEvent#startDeltaによってPointDownEvent時からの移動量が、
	 * PointUpEvent#prevDeltaによって直近のPointMoveEventからの移動量が取得出来る。
	 * PointUpEvent#pointにはPointDownEvent#pointと同じ値が格納される。
	 */
	export class PointUpEvent extends PointEvent {
		type: EventType = EventType.PointUp;
		startDelta: CommonOffset;
		prevDelta: CommonOffset;

		constructor(pointerId: number, target: E, point: CommonOffset,
		            prevDelta: CommonOffset, startDelta: CommonOffset, player?: Player, local?: boolean, priority?: number) {
			super(pointerId, target, point, player, local, priority);
			this.prevDelta = prevDelta;
			this.startDelta = startDelta;
		}
	}

	/**
	 * ポインティング操作の移動を表すイベント。
	 * PointDownEvent後にのみ発生するため、MouseMove相当のものが本イベントとして発生することはない。
	 *
	 * PointMoveEvent#startDeltaによってPointDownEvent時からの移動量が、
	 * PointMoveEvent#prevDeltaによって直近のPointMoveEventからの移動量が取得出来る。
	 * PointMoveEvent#pointにはPointMoveEvent#pointと同じ値が格納される。
	 *
	 * 本イベントは、プレイヤーがポインティングデバイスを移動していなくても、
	 * カメラの移動等視覚的にポイントが変化している場合にも発生する。
	 */
	export class PointMoveEvent extends PointEvent {
		type: EventType = EventType.PointMove;
		startDelta: CommonOffset;
		prevDelta: CommonOffset;

		constructor(pointerId: number, target: E, point: CommonOffset,
		            prevDelta: CommonOffset, startDelta: CommonOffset, player?: Player, local?: boolean, priority?: number) {
			super(pointerId, target, point, player, local, priority);
			this.prevDelta = prevDelta;
			this.startDelta = startDelta;
		}
	}

	/**
	 * 汎用的なメッセージを表すイベント。
	 * MessageEvent#dataによってメッセージ内容を取得出来る。
	 */
	export class MessageEvent implements Event {
		type: EventType = EventType.Message;
		priority: number;
		local: boolean;
		player: Player;
		data: any;

		constructor(data: any, player?: Player, local?: boolean, priority?: number) {
			this.priority = priority;
			this.local = local;
			this.player = player;
			this.data = data;
		}
	}

	/**
	 * 操作プラグインが通知する操作を表すイベント。
	 * プラグインを識別する `OperationEvent#code` と、プラグインごとの内容 `OperationEvent#data` を持つ。
	 */
	export class OperationEvent implements Event {
		type: EventType = EventType.Operation;
		priority: number;
		local: boolean;
		player: Player;
		code: number;
		data: any;

		constructor(code: number, data: any, player?: Player, local?: boolean, priority?: number) {
			this.priority = priority;
			this.local = local;
			this.player = player;
			this.code = code;
			this.data = data;
		}
	}

	/**
	 * プレイヤーの参加を表すイベント。
	 * JoinEvent#playerによって、参加したプレイヤーを取得出来る。
	 */
	export class JoinEvent implements Event {
		type: EventType = EventType.Join;
		priority: number;
		player: Player;
		storageValues: StorageValueStore;

		constructor(player: Player, storageValues?: StorageValueStore, priority?: number) {
			this.priority = priority;
			this.player = player;
			this.storageValues = storageValues;
		}
	}

	/**
	 * プレイヤーの離脱を表すイベント。
	 * LeaveEvent#playerによって、離脱したプレイヤーを取得出来る。
	 */
	export class LeaveEvent implements Event {
		type: EventType = EventType.Leave;
		priority: number;
		player: Player;

		constructor(player: Player, priority?: number) {
			this.priority = priority;
			this.player = player;
		}
	}

	/**
	 * タイムスタンプを表すイベント。
	 */
	export class TimestampEvent implements Event {
		type: EventType = EventType.Timestamp;
		priority: number;
		player: Player;
		timestamp: number;

		constructor(timestamp: number, player: Player, priority?: number) {
			this.priority = priority;
			this.player = player;
			this.timestamp = timestamp;
		}
	}

	/**
	 * 新しい乱数の発生を表すイベント。
	 * SeedEvent#generatorによって、本イベントで発生したRandomGeneratorを取得出来る。
	 */
	export class SeedEvent implements Event {
		type: EventType = EventType.Seed;
		priority: number;
		generator: RandomGenerator;

		constructor(generator: RandomGenerator, priority?: number) {
			this.priority = priority;
			this.generator = generator;
		}
	}
}
