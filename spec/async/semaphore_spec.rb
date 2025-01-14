# frozen_string_literal: true

# Released under the MIT License.
# Copyright, 2018-2022, by Samuel Williams.

require 'async/semaphore'
require 'async/barrier'
require 'async/rspec'

require_relative 'chainable_async_examples'

RSpec.describe Async::Semaphore do
	include_context Async::RSpec::Reactor
	
	context '#async' do
		let(:repeats) {40}
		let(:limit) {4}
		
		it 'should process work in batches' do
			semaphore = Async::Semaphore.new(limit)
			current, maximum = 0, 0
			
			result = repeats.times.map do |i|
				semaphore.async do |task|
					current += 1
					maximum = [current, maximum].max
					task.sleep(rand * 0.1)
					current -= 1
					
					i
				end
			end.collect(&:wait)
			
			# Verify that the maximum number of concurrent tasks was the specificed limit:
			expect(maximum).to be == limit
			
			# Verify that the results were in the correct order:
			expect(result).to be == (0...repeats).to_a
		end
		
		it 'only allows one task at a time' do
			semaphore = Async::Semaphore.new(1)
			order = []
			
			3.times.map do |i|
				semaphore.async do |task|
					order << i
					task.sleep(0.1)
					order << i
				end
			end.collect(&:wait)
			
			expect(order).to be == [0, 0, 1, 1, 2, 2]
		end
		
		it 'allows tasks to execute concurrently' do
			semaphore = Async::Semaphore.new(3)
			order = []
			
			3.times.map do |i|
				semaphore.async do |task|
					order << i
					task.sleep(0.1)
					order << i
				end
			end.collect(&:wait)
			
			expect(order).to be == [0, 1, 2, 0, 1, 2]
		end
	end
	
	context '#waiting' do
		subject {Async::Semaphore.new(0)}
		it 'handles exceptions thrown while waiting' do
			expect do
				reactor.with_timeout(0.1) do
					subject.acquire do
					end
				end
			end.to raise_exception(Async::TimeoutError)
			
			expect(subject.waiting).to be_empty
		end
	end
	
	context '#count' do
		it 'should count number of current acquisitions' do
			expect(subject.count).to be == 0
			
			subject.acquire do
				expect(subject.count).to be == 1
			end
		end
	end
	
	context '#limit' do
		it 'should have a default limit' do
			expect(subject.limit).to be == 1
		end
	end
	
	context '#empty?' do
		it 'should be empty unless acquired' do
			expect(subject).to be_empty
			
			subject.acquire do
				expect(subject).to_not be_empty
			end
		end
	end
	
	context '#blocking?' do
		it 'will be blocking when acquired' do
			expect(subject).to_not be_blocking
			
			subject.acquire do
				expect(subject).to be_blocking
			end
		end
	end
	
	context '#acquire/#release' do
		it 'works when called without block' do
			subject.acquire
			
			expect(subject.count).to be == 1
			
			subject.release
			
			expect(subject.count).to be == 0
		end
	end
	
	context 'with barrier' do
		let(:capacity) {2}
		let(:barrier) {Async::Barrier.new}
		let(:repeats) {capacity * 2}
		
		it 'should execute several tasks and wait using a barrier' do
			repeats.times do
				subject.async(parent: barrier) do |task|
					task.sleep 0.1
				end
			end
			
			expect(barrier.size).to be == repeats
			barrier.wait
		end
	end
	
	it_behaves_like 'chainable async'
end
