namespace g {
	/**
	 * 時間経過の契機(ティック)をどのように生成するか。
	 * ただしローカルティック(ローカルシーンの間などの「各プレイヤー間で独立な時間経過処理」)はこのモードの影響を受けない。
	 */
	export enum TickGenerationMode {
		/**
		 * 実際の時間経過に従う。
		 */
		ByClock,

		/**
		 * 時間経過は明示的に要求する。
		 * この値を用いる `Scene` の間は、 `Game#raiseTick()` を呼び出さない限り時間経過が起きない。
		 */
		Manual
	}
}
